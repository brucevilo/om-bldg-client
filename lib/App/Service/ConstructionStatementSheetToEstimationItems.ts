import XLSX, { Sheet } from 'xlsx';
import { cloneDeep, range } from 'lodash';
import { AssetClass, Construction } from '@/Domain/Entity';
import {
    ConstructionType,
    ConstructionTypes,
    CostDocument,
} from '@/Domain/ValueObject';
import { EstimationItem } from '@/Domain/ValueObject';
import { assertsIsExists } from '@/Infrastructure';
import { notDirectConstructionPrices } from '@/App/Service/ConstructionTypeService';
import {
    checkCoverItemWithWorkSheetName,
    checkEolNone,
} from './Validaty/CostDocumentToEstimationSheet';
import { CostDocumentFormatChecker } from '@/Domain/Service/CostDocumentFormatChecker';
import { CoverItemWithWorkSheetError } from './CoverItemWithWorkSheetError';

type Col = string | number | Date | null;
type Row = Col[];
export enum RowIndex {
    ConstructionNameIdx = 0, // 工事名
    ConstructionTypeIdx = 1, // 工事種別
    UnitPriceIdx = 10,
    PriceIdx = 11, // 価格
}

export type CostDocumentConstructionSheetData = {
    constructionName: string;
    items: EstimationItem[];
    constructionTerm: string;
};

type EstimationItemCellValues = {
    constructionTime: string;
    transportationTime: string;
    priceCode: number | null;
    name: string;
    dimension: string;
    amount: number;
    unit: string;
    unitPrice: number;
    price: number;
    remarks: string;
    assetClassInfo: string;
    tags: string[];
};

export class ConstructionStatementSheetToEstimationItems {
    constructor(
        public costDocument: CostDocument,
        public assetClasses: AssetClass[],
        public construction: Construction,
        public isDesignChange: boolean,
    ) {}

    // @FIXME 工事管理シートのエラーをチェックしている。名が体を表していない
    public setup(): void {
        const coverSheet = this.costDocument.coverSheet;
        const coverKeys = Object.keys(coverSheet);
        const formatChecker = new CostDocumentFormatChecker(this.costDocument);
        const formatCheckResult = formatChecker.allKoujimeiSameCheck();
        if (formatCheckResult.result === false) {
            throw new CoverItemWithWorkSheetError(
                `表紙の明細名と一致する工事シート名(${formatCheckResult.errorKoujiSheetKoujimei})が存在しません`,
            );
        }
        checkEolNone(coverKeys, coverSheet, this.costDocument.eofCol);
        checkCoverItemWithWorkSheetName(coverSheet, this.costDocument);
    }

    /**
     * シート内の構造
     * 工事名: C2
     * 工事費内訳書1ページ: C<5 + 23 * n> - L<24 + 23 * n>
     * シート内の工事内訳書ページ数: J2 - F2
     *
     * 表紙でないページの定義
     * 先頭行が◇で始まっている
     * テキストではなくフォーマットとして指定されているのでCell.wで取得する必要があるので注意
     *
     * ページ内の行数（工種、小計含む）
     * 20行
     */
    public invoke(sheet: XLSX.Sheet): EstimationItem[] {
        const step = 23;
        const pageRows = 20;
        const constructionName = this.constructionName(sheet);
        const constructionTerm = this.constructionTerm(sheet);
        const pageNum = this.pageNum(sheet);
        const pages = range(pageNum)
            .filter(n => {
                // 表紙でないページのみ対象とする
                const firstRow = 5 + step * n;
                const cell = sheet[`C${firstRow}`];
                // 先頭行が空の場合は表紙の続き
                if (cell === undefined) return false;
                return (cell.w as string).startsWith('◇');
            })
            .map(n => {
                const firstRow = 5 + step * n;
                const constructionType = sheet[`C${firstRow}`]
                    .v as ConstructionType;
                if (!ConstructionType.includes(constructionType)) {
                    throw new Error(
                        `工事名: ${constructionName}\ncell: C${firstRow}\n不明な工種（${constructionType}）です`,
                    );
                }

                return range(pageRows)
                    .filter(r => {
                        const row = firstRow + r;
                        // 明細行のみを処理（数量に記載がある行）
                        // 値の記入のないセルはundefinedになる
                        return sheet[`F${row}`] !== undefined;
                    })
                    .map(r => {
                        const row = firstRow + r;
                        const cellValues = this.estimationItemCellValues(
                            sheet,
                            row,
                            constructionType,
                        );
                        return new EstimationItem({
                            ...cellValues,
                            constructionName,
                            constructionTerm,
                            constructionType,
                        });
                    })
                    .filter(ei => ei.price !== 0);
            })
            .concat(this.sheetToManagementFeeEstimationItems(sheet));

        const estimationItems = pages.flat();
        return this.isDesignChange
            ? this.accountTruncatedPriceToPublicManagedPriceEstimationItems(
                  estimationItems,
              )
            : estimationItems;
    }

    /**
     * 現場管理費と一般管理費等をEstimationItemにする
     */
    private sheetToManagementFeeEstimationItems(sheet: Sheet) {
        let commonManagementFee: number | null = null;
        let onSiteManagementFee: number | null = null;
        const estimationItemParams = {
            constructionName: this.constructionName(sheet),
            constructionTerm: this.constructionTerm(sheet),
            amount: 1,
            unit: '式',
            assetClassInfo: '費用',
        };
        for (let i = 5; i < 100; i++) {
            const nameCell = sheet[`D${i}`];
            if (nameCell && nameCell.v === '現場管理費・一般管理費等') {
                const fee = sheet[`I${i}`] ? sheet[`I${i}`].v : 0;
                return [
                    new EstimationItem({
                        name: '現場管理費・一般管理費等',
                        constructionType: '現場管理費・一般管理費等',
                        unitPrice: fee,
                        price: fee,
                        ...estimationItemParams,
                    }),
                ];
            }
            if (nameCell && nameCell.v === '一般管理費等') {
                commonManagementFee = sheet[`I${i}`].v;
            }
            if (nameCell && nameCell.v === '現場管理費') {
                onSiteManagementFee = sheet[`I${i}`].v;
            }
        }
        return [
            new EstimationItem({
                name: '一般管理費等',
                constructionType: '一般管理費等',
                unitPrice: commonManagementFee || 0,
                price: commonManagementFee || 0,
                ...estimationItemParams,
            }),
            new EstimationItem({
                name: '現場管理費',
                constructionType: '現場管理費',
                unitPrice: onSiteManagementFee || 0,
                price: onSiteManagementFee || 0,
                ...estimationItemParams,
            }),
        ].filter(ei => ei.price !== 0);
    }

    private estimationItemCellValues(
        sheet: XLSX.Sheet,
        row: number,
        constructionType: ConstructionType,
    ): EstimationItemCellValues {
        try {
            return {
                constructionTime: sheet[`A${row}`]
                    ? sheet[`A${row}`].v.toString()
                    : '',
                transportationTime: sheet[`B${row}`]
                    ? sheet[`B${row}`].v.toString()
                    : '',
                priceCode: sheet[`C${row}`] ? sheet[`C${row}`].v : null,
                name: sheet[`D${row}`]?.v || '',
                dimension: sheet[`E${row}`] ? sheet[`E${row}`].v : '',
                amount: sheet[`F${row}`].v,
                unit: sheet[`G${row}`]?.v || '',
                unitPrice: sheet[`H${row}`] ? sheet[`H${row}`].v : 0,
                price: sheet[`I${row}`].v,
                remarks: sheet[`J${row}`] ? sheet[`J${row}`].v : '',
                assetClassInfo: this.assetClassInfo(
                    sheet,
                    row,
                    constructionType,
                ),
                tags: sheet[`L${row}`] ? [sheet[`L${row}`].v] : [],
            };
        } catch (e) {
            console.error('変換に失敗しました');
            console.debug(sheet);
            console.debug(row);
            throw e;
        }
    }

    private assetClassInfo(
        sheet: XLSX.Sheet,
        row: number,
        constructionType: ConstructionType,
    ): string {
        const assetClassName: string = sheet[`N${row}`]
            ? sheet[`N${row}`].v
            : '建物';
        return ConstructionTypes.isCapitalization(constructionType)
            ? assetClassName
            : '費用';
    }

    public constructionName(sheet: Sheet): string {
        return sheet['C2'].v;
    }

    public isCollateralConstruction(sheet: Sheet): boolean {
        return this.pageNum(sheet) === 1;
    }

    public constructionTerm(sheet: Sheet): Date | null {
        if (sheet['K1']) {
            return sheet['K1'].v; // FIXME 実際には number 型の値が返却されている
        } else {
            return null;
        }
    }

    private pageNum(sheet: Sheet): number {
        return sheet['J2'].v - sheet['F2'].v;
    }

    private estimationItemToEstimationSheetRow(item: EstimationItem): Row {
        return [
            item.constructionName,
            item.constructionType,
            item.constructionTerm,
            item.constructionTime,
            item.transportationTime,
            item.priceCode || '',
            item.name,
            item.dimension,
            item.amount,
            item.unit,
            item.unitPrice,
            item.price,
            item.remarks,
            item.assetClassInfo,
            item.tags[0] || '',
            '',
            '',
            '',
        ];
    }

    /**
     * 設計変更の際は、
     * 共通仮設費・現場管理費・一般管理費の処理は初期の落札率を乗じて、小数点以下を切り捨てる
     * 直接工事費は初期の落札率を乗じて、整数３桁目の切り捨てを行う
     */
    private calcEstimationItemProratedPrice(item: EstimationItem) {
        if (!this.isDesignChange) return item.price;
        if (!this.isDirectConstructionEstimationItem(item)) {
            return Math.floor(item.price * this.construction.contracts[0].rate);
        }

        const calcChangedDirectConstructionEstimationItemRowPrice = (
            item: EstimationItem,
        ): number => {
            return item.price >= 0
                ? Math.floor(
                      (item.price * this.construction.contracts[0].rate) / 1000,
                  ) * 1000
                : Math.ceil(
                      (item.price * this.construction.contracts[0].rate) / 1000,
                  ) * 1000;
        };
        return calcChangedDirectConstructionEstimationItemRowPrice(item);
    }

    /**
     * 一般管理費に予定価格を算出する際に整数３桁目を切り捨てた分を計上する
     */
    private accountTruncatedPriceToPublicManagedPriceEstimationItems(
        estimationItems: EstimationItem[],
    ) {
        const statementChangedExpectedPrice =
            this.statementChangePrice(estimationItems);
        const proratedEstimationItems = estimationItems.map(item => {
            const proratedPrice = this.calcEstimationItemProratedPrice(item);
            const newItem = item.setPriceEstimationItem(proratedPrice);
            newItem.setPriceEstimationItem(0);
            return newItem;
        });
        const truncatePrice =
            statementChangedExpectedPrice -
            proratedEstimationItems.reduce((sum, item) => {
                return sum + item.price;
            }, 0);

        const _publicManagePriceEstimationItem = proratedEstimationItems.find(
            item =>
                item.constructionType === '一般管理費等' ||
                item.constructionType === '現場管理費・一般管理費等',
        );
        assertsIsExists(
            _publicManagePriceEstimationItem,
            '一般管理費が工事明細にありません',
        );
        const publicManagePriceEstimationItem = cloneDeep(
            _publicManagePriceEstimationItem,
        );
        publicManagePriceEstimationItem.price =
            publicManagePriceEstimationItem.price + truncatePrice;
        const items = proratedEstimationItems
            .filter(
                item =>
                    item.constructionType !== '一般管理費等' &&
                    item.constructionType !== '現場管理費・一般管理費等',
            )
            .concat([publicManagePriceEstimationItem])
            .map(item => {
                if (item.isUnitPriceEqualPrice()) {
                    item.unitPrice = item.price;
                }
                return item;
            });
        return items;
    }

    private isDirectConstructionEstimationItem(item: EstimationItem) {
        return !notDirectConstructionPrices.includes(item.constructionType);
    }

    // 変更後の差し引き増減金額、内訳書の変更諸経費表の算出方法をそのまま使う、g14など該当のセルのkeyをコメントで残す
    private statementChangePrice(items: EstimationItem[]) {
        // g14
        const 直接工事費 = items
            .filter(ci => this.isDirectConstructionEstimationItem(ci))
            .reduce((sum, ci) => sum + ci.price, 0);
        // g15
        const 共通仮設費 = items
            .filter(ci => ci.constructionType === '共通仮設費')
            .reduce((sum, ei) => sum + ei.price, 0);

        const 現場管理費資産明細 = items.find(
            ci => ci.constructionType === '現場管理費',
        );
        // g66
        const 現場管理費 = 現場管理費資産明細 ? 現場管理費資産明細.price : 0;
        const 一般管理費等資産明細 = items.find(
            ci => ci.constructionType === '一般管理費等',
        );
        // g74
        const 一般管理費等 = 一般管理費等資産明細
            ? 一般管理費等資産明細.price
            : 0;
        // g13
        const 純工事費 = 直接工事費 + 共通仮設費;
        // g75
        const 工事価格1 = 純工事費 + 現場管理費 + 一般管理費等;
        // g79
        const 変更工事価格 =
            工事価格1 < 0
                ? Math.floor(
                      (工事価格1 * this.construction.firstContract.rateDown4) /
                          1000,
                  ) * 1000
                : Math.floor(
                      (工事価格1 * this.construction.firstContract.rateDown4) /
                          1000,
                  ) * 1000;
        return 変更工事価格;
    }
}

export const constructionNamesWithConstructionStatementNames = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): string[][] => {
    const eofRowIndex = costDocument.eofRowIndex;
    let rowIndex = costDocument.firstRowIndex;
    const constructionNames: string[] = [];
    const constructionStatementNames: string[] = [];
    while (true) {
        if (rowIndex > eofRowIndex - 2) {
            break;
        }
        const celD = coverSheet[`D${rowIndex}`];
        const key = `${costDocument.keyLine}${rowIndex}`;
        if (coverSheet[`${key}`] && costDocument.isPartRow(key)) {
            constructionNames.push(celD.v);
        } else if (
            coverSheet[`${key}`] &&
            costDocument.isConstructionStatementChangedRow(key)
        ) {
            constructionStatementNames.push(celD.v);
        }
        rowIndex++;
    }
    return [constructionNames, constructionStatementNames];
};

// 費目：松屋町駅の部、工事明細名：A工事、B工事の2行があった場合に、[松屋町駅の部-工事A, 松屋町駅の部-工事B]のような配列を作る
export const connectKoujiHimokuAndKoujiMeisaimeiWithHyphen = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): string[] => {
    const eofRowIndex = costDocument.eofRowIndex;
    let rowIndex = costDocument.firstRowIndex;
    const result: string[] = [];
    let himoku = '';
    while (true) {
        if (rowIndex > eofRowIndex - 2) {
            break;
        }
        const meishouColumn = coverSheet[`D${rowIndex}`];
        const key = `${costDocument.keyLine}${rowIndex}`;
        if (coverSheet[`${key}`] && costDocument.isPartRow(key)) {
            himoku = meishouColumn.v;
        }
        if (
            coverSheet[`${key}`] &&
            costDocument.isConstructionStatementChangedRow(key)
        ) {
            result.push(`${himoku}-${meishouColumn.v}`);
        }
        rowIndex++;
    }
    return result;
};
