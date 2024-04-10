import { Excel, Sheet, WorkBook } from '@/Infrastructure';
import { range } from 'lodash';
import { convertToAscii } from './utils';
import { CostItem } from './entities/CostItem';

export type DesignStatementMaster = {
    costDocument: File;
    constructionName: string;
    designChangeNumber: number;
    constructionStatements: ConstructionStatementMaster[];
};

export type ConstructionStatementMaster = {
    designChangeNumber: number;
    sheetName: string;
    name: string;
    items: CostItemMaster[];
    assets: AssetItemMaster[];
};

export type CostItemMaster = {
    designChangeNumber: number;
    sheetName: string;
    constructionStatementName: string;
    id: string;
    constructionType: string;
    constructionTime: string;
    transportationTime: string;
    code: number | null;
    name: string;
    dimension: string;
    amount: number;
    unit: string;
    unitPrice: number;
    price: number;
    remarks1: string;
    remarks2: string;
    remarks3: string;
    assetClassDivision: string;
};

export type AssetItemMasterListMap = {
    [sheetName: string]: AssetItemMaster[];
};

export type AssetItemMaster = {
    sheetName: string;
    typeName: string;
    assetName: string;
    assetType: string;
    department: string;
    prevPrice: number;
    price: number;
    diffPrice: number;
    assetClassCode: string;
};

export async function readCostDocument(
    file: File,
): Promise<DesignStatementMaster> {
    const book = await Excel.read(file);
    const coverSheet = book.Sheets['表紙'];
    if (!coverSheet) {
        throw new Error(`表紙が見つかりませんでした。: ${file.name}`);
    }
    let constructionName: string;
    let designChangeNumber: number;
    if (['明細情報', '案件情報'].includes(coverSheet['H2']?.v)) {
        constructionName = coverSheet['D12']?.v;
        designChangeNumber = 0;
    } else if (['明細情報', '案件情報'].includes(coverSheet['L1']?.v)) {
        constructionName = coverSheet['D11']?.v;
        designChangeNumber = Number(
            convertToAscii(
                String(coverSheet['C13'].v).replace(
                    /第[ 　]?([0-9０-９])[ 　]?回.+/,
                    '$1',
                ),
            ),
        );
    } else {
        throw new Error(
            `表紙から工事情報を読み取れませんでした。: ${file.name}`,
        );
    }
    constructionName = convertToAscii(constructionName);
    const designStatement: DesignStatementMaster = {
        constructionName: constructionName,
        costDocument: file,
        designChangeNumber: designChangeNumber,
        constructionStatements: [],
    };
    let assetItemsMap: AssetItemMasterListMap = {};
    const assetSheet =
        book.Sheets['資産管理明細書'] || book.Sheets['資産管理明細'];
    if (assetSheet) {
        assetItemsMap = readAssetItems(assetSheet, designChangeNumber);
    }
    const costItemSheetData = getConstructionSheetNames(book).map(n => {
        const constructionStatement = readCostItems(
            book.Sheets[n],
            designChangeNumber,
            n,
            assetItemsMap[n] ? assetItemsMap[n] : [],
        );
        return constructionStatement;
    });
    designStatement.constructionStatements.push(...costItemSheetData);
    return designStatement;
}

function fixConstructionType(constructionType: string): string {
    if (constructionType === 'ユニット及びその他工事') {
        return 'ユニット及びその他の工事';
    } else if (constructionType === '直接仮設工事費') {
        return '直接仮設工事';
    } else if (constructionType === '部分撤去工事費') {
        return '部分撤去工事';
    } else if (constructionType === '一般管理費') {
        return '一般管理費等';
    } else if (constructionType === '屋根及びとい工事') {
        return '屋根及び樋工事';
    }
    return constructionType;
}

function readCostItems(
    sheet: Sheet,
    designChangeNo: number,
    sheetName: string,
    assets: AssetItemMaster[],
): ConstructionStatementMaster {
    const step = 23;
    const pageRows = 20;
    const constructionStatementName = convertToAscii(String(sheet['C2'].v));
    const pageNum = sheet['J2'].v - sheet['F2'].v;
    let index = 0;
    let items: CostItemMaster[] = [];
    if (pageNum === 1) {
        const firstRow = 5;
        items = range(pageRows)
            .filter(r => {
                const row = firstRow + r;
                return sheet[`F${row}`] !== undefined;
            })
            .flatMap(r => {
                const row = firstRow + r;
                const ret = readCostItemCellValues(
                    sheet,
                    row,
                    '',
                    constructionStatementName,
                    designChangeNo,
                    sheetName,
                    index,
                );
                if (ret.price === 0) {
                    return [];
                }
                ret.constructionType = fixConstructionType(ret.name);
                ret.assetClassDivision = readAssetClass(
                    sheet,
                    row,
                    ret.constructionType,
                );
                index++;
                return ret;
            });
    } else {
        items = range(pageNum)
            .filter(n => {
                // 表紙でないページのみ対象とする
                const firstRow = 5 + step * n;
                const cell = sheet[`C${firstRow}`];
                // 先頭行が空の場合は表紙の続き
                if (cell === undefined) return false;
                return (cell.w as string).startsWith('◇');
            })
            .flatMap(n => {
                const firstRow = 5 + step * n;
                const constructionType = fixConstructionType(
                    sheet[`C${firstRow}`].v,
                );
                return range(pageRows)
                    .filter(r => {
                        const row = firstRow + r;
                        return sheet[`F${row}`] !== undefined;
                    })
                    .flatMap(r => {
                        const row = firstRow + r;
                        const ret = readCostItemCellValues(
                            sheet,
                            row,
                            constructionType,
                            constructionStatementName,
                            designChangeNo,
                            sheetName,
                            index,
                        );
                        if (ret.price === 0) {
                            return [];
                        }
                        index++;
                        return ret;
                    });
            });
    }
    return {
        designChangeNumber: designChangeNo,
        name: constructionStatementName,
        sheetName: sheetName,
        items: items,
        assets: assets,
    };
}

function readCostItemCellValues(
    sheet: Sheet,
    row: number,
    constructionType: string,
    constructionStatementName: string,
    designChangeNumber: number,
    sheetName: string,
    index: number,
): CostItemMaster {
    try {
        return {
            id: `${designChangeNumber}-${sheetName}-${index}`,
            constructionType: constructionType,
            constructionTime: sheet[`A${row}`] ? sheet[`A${row}`].v : '',
            transportationTime: sheet[`B${row}`] ? sheet[`B${row}`].v : '',
            code: sheet[`C${row}`] ? sheet[`C${row}`].v : null,
            name: sheet[`D${row}`]?.v || '',
            dimension: sheet[`E${row}`] ? sheet[`E${row}`].v : '',
            amount: sheet[`F${row}`].v,
            unit: sheet[`G${row}`]?.v || '',
            unitPrice: sheet[`H${row}`] ? Math.round(sheet[`H${row}`].v) : 0,
            price: Math.round(sheet[`I${row}`].v),
            remarks1: sheet[`J${row}`] ? String(sheet[`J${row}`].v) : '',
            remarks2: sheet[`K${row}`] ? String(sheet[`K${row}`].v) : '',
            remarks3: sheet[`L${row}`] ? String(sheet[`L${row}`].v) : '',
            assetClassDivision: readAssetClass(sheet, row, constructionType),
            designChangeNumber: designChangeNumber,
            constructionStatementName: constructionStatementName,
            sheetName: sheetName,
        };
    } catch (e) {
        console.error('変換に失敗しました');
        console.debug(sheet);
        console.debug(row);
        throw e;
    }
}

function readAssetClass(
    sheet: Sheet,
    row: number,
    constructionType: string,
): string {
    const assetClassName: string = sheet[`N${row}`]
        ? sheet[`N${row}`].v
        : '建物';
    return CostItem.isExpence(constructionType) ? '費用' : assetClassName;
}

function getConstructionSheetNames(book: WorkBook): string[] {
    return book.SheetNames.filter(n => /^工事[0-9]+$/.test(n));
}

function readAssetItems(
    sheet: Sheet,
    designChangeNumber: number,
): AssetItemMasterListMap {
    const firstRow = 3;
    const step = 23;
    const pageNum = sheet['J2'].v - sheet['F2'].v;
    const assetItems = range(firstRow, pageNum * step)
        .filter(n => {
            const cell = sheet[`A${n}`];
            return cell !== undefined && cell.v.startsWith('工事');
        })
        .map(n => {
            if (designChangeNumber === 0) {
                return readAssetItemCellValues(sheet, n);
            } else {
                return readDesignChangedAssetItemCellValues(sheet, n);
            }
        });
    const assetItemsMap: AssetItemMasterListMap = {};
    assetItems.forEach(item => {
        if (assetItemsMap[item.sheetName] === undefined) {
            assetItemsMap[item.sheetName] = [];
        }
        assetItemsMap[item.sheetName].push(item);
    });
    return assetItemsMap;
}

function readAssetItemCellValues(sheet: Sheet, row: number): AssetItemMaster {
    try {
        return {
            sheetName: sheet[`A${row}`].v,
            typeName: sheet[`C${row}`] ? String(sheet[`C${row}`].v) : '',
            assetName: sheet[`D${row}`] ? String(sheet[`D${row}`].v) : '',
            assetType: sheet[`E${row}`] ? String(sheet[`E${row}`].v) : '',
            department: sheet[`G${row}`] ? String(sheet[`G${row}`].v) : '',
            prevPrice: 0,
            price: sheet[`H${row}`] ? sheet[`H${row}`].v : 0,
            diffPrice: 0,
            assetClassCode: sheet[`I${row}`] ? String(sheet[`I${row}`].v) : '',
        };
    } catch (e) {
        console.error('変換に失敗しました');
        console.debug(sheet);
        console.debug(row);
        throw e;
    }
}

function readDesignChangedAssetItemCellValues(
    sheet: Sheet,
    row: number,
): AssetItemMaster {
    try {
        return {
            sheetName: sheet[`A${row}`].v,
            typeName: sheet[`C${row}`] ? String(sheet[`C${row}`].v) : '',
            assetName: sheet[`D${row}`] ? String(sheet[`D${row}`].v) : '',
            assetType: sheet[`E${row}`] ? String(sheet[`E${row}`].v) : '',
            department: sheet[`F${row}`] ? String(sheet[`F${row}`].v) : '',
            prevPrice: sheet[`G${row}`] ? sheet[`G${row}`].v : 0,
            price: sheet[`H${row}`] ? sheet[`H${row}`].v : 0,
            diffPrice: sheet[`I${row}`] ? sheet[`I${row}`].v : 0,
            assetClassCode: sheet[`J${row}`] ? String(sheet[`J${row}`].v) : '',
        };
    } catch (e) {
        console.error('変換に失敗しました');
        console.debug(sheet);
        console.debug(row);
        throw e;
    }
}
