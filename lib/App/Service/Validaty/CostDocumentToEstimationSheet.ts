import {
    stringAdaptFormats,
    fullAlphabetAndNumberToHalf,
} from '@/App/utils/stringAdaptformats';
import { CostDocument } from '@/Domain/ValueObject';
import XLSX from 'xlsx';
import { CoverItemWithWorkSheetError } from '../CoverItemWithWorkSheetError';

// エラー5
export const checkCoverItemWithWorkSheetName = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): void => {
    const eofRowIndex = costDocument.eofRowIndex;
    let rowIndex = costDocument.firstRowIndex;
    const coverConstructions: string[] = [];
    const constructionSheetNames = costDocument.constructionSheetNames;
    while (true) {
        if (rowIndex > eofRowIndex - 2) {
            break;
        }
        const key = `${costDocument.keyLine}${rowIndex}`;
        if (
            coverSheet[`${key}`] &&
            costDocument.isConstructionStatementChangedRow(key)
        ) {
            coverConstructions.push(coverSheet[`${key}`].v);
        }
        rowIndex++;
    }
    if (coverConstructions.length !== constructionSheetNames.length) {
        throw new CoverItemWithWorkSheetError(
            '表紙の明細の数と工事シートの数が一致しません',
        );
    }
    constructionSheetNames.forEach(constructionName => {
        if (
            !coverConstructions
                .map(s => stringAdaptFormats(s, fullAlphabetAndNumberToHalf))
                .includes(
                    stringAdaptFormats(
                        constructionName,
                        fullAlphabetAndNumberToHalf,
                    ),
                )
        ) {
            throw new CoverItemWithWorkSheetError(
                `表示の明細と工事シートの明細(${constructionName})が一致しません。`,
            );
        }
    });
};

// エラー4
export const checkEolNone = (
    coverKeys: string[],
    coverSheet: XLSX.Sheet,
    eolLine: string,
): void => {
    const coverSheetsKeyLineColumns = coverKeys.filter(
        (key: string) => key.slice(0, 1) === eolLine,
    );
    const coverArrayEol: string[] = [];
    coverSheetsKeyLineColumns.map(column => {
        coverArrayEol.push(coverSheet[column].v);
    });
    if (!coverArrayEol.includes('EOL')) {
        throw new CoverItemWithWorkSheetError(
            `${eolLine}列にEOLが存在しません`,
        );
    }
};

// エラー6
export const checkDetailExceptPriceSlipNotation = (
    coverSheet: XLSX.Sheet,
    rowIndex: number,
): void => {
    const priceRowNames: string[] = [];
    ['E', 'F', 'G', 'H', 'I', 'J', 'M'].map(cel => {
        if (coverSheet[`${cel}${rowIndex - 1}`]) {
            priceRowNames.push(
                coverSheet[`${cel}${rowIndex - 1}`].v.replace(/\s+/g, ''),
            );
        }
    });
    priceRowNames.forEach(name => {
        if (
            !['形状寸法', '数量', '単位', '単価', '金額', '摘要'].includes(name)
        ) {
            throw new CoverItemWithWorkSheetError(
                '明細行以外の金額行の表記が正しくありません',
            );
        }
    });
};

// エラー11
export const checkNameArrayDColumn = (
    coverSheet: XLSX.Sheet, // eslint-disable-line @typescript-eslint/no-unused-vars
    rowIndex: number, // eslint-disable-line @typescript-eslint/no-unused-vars
): void => {
    // 仕様が定まっていないため、一旦コメントアウト
    // const name = coverSheet[`D${rowIndex - 1}`].v;
    // if (name !== '名称') {
    //     throw new CoverItemWithWorkSheetError('名前列がD列にありません');
    // }
};

// エラーチェックリスト12
export const checkEofFrontRearAmountNone = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): void => {
    const eofRowIndex = costDocument.eofRowIndex;
    const priceLine = costDocument.priceLine;
    if (
        coverSheet[`${priceLine}${eofRowIndex - 1}`] &&
        coverSheet[`${priceLine}${eofRowIndex - 1}`].v > 0
    ) {
        return;
    }
    throw new CoverItemWithWorkSheetError(
        `eofの前行の${priceLine}列に金額がありません`,
    );
};

// エラーチェックリスト13
export const checkMemoExistence = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): void => {
    const cell = `${costDocument.memoLine}${costDocument.firstRowIndex - 1}`;
    if (!/.*摘.*要.*/.test(coverSheet[`${cell}`].v)) {
        throw new CoverItemWithWorkSheetError(`摘要が${cell}にありません`);
    }
};

// エラーチェックリスト14
export const checkDetailExistence = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): void => {
    const eofRowIndex = costDocument.eofRowIndex;
    let rowIndex = costDocument.firstRowIndex;
    const priceLine = costDocument.priceLine;
    while (true) {
        if (rowIndex > eofRowIndex) {
            throw new Error(
                '名称列に値があって金額列に値のない行が存在しません',
            );
        }
        if (
            coverSheet[`D${rowIndex}`] &&
            coverSheet[`${priceLine}${rowIndex}`] == null
        ) {
            break;
        }
        rowIndex++;
    }
};

// 表紙に費目の表記があるかチェック
export const checkDepartmentNameExistence = (
    coverSheet: XLSX.Sheet,
    costDocument: CostDocument,
): void => {
    const keyLine = costDocument.keyLine;
    const eofRowIndex = costDocument.eofRowIndex;
    let rowIndex = costDocument.firstRowIndex;
    const coverDepartmentNames: string[] = [];
    while (true) {
        if (rowIndex > eofRowIndex - 2) {
            break;
        }
        const key = `${costDocument.keyLine}${rowIndex}`;
        if (coverSheet[`${key}`] && costDocument.isPartRow(key)) {
            coverDepartmentNames.push(coverSheet[`${key}`].v);
        }
        rowIndex++;
    }
    if (coverDepartmentNames.length === 0) {
        throw new CoverItemWithWorkSheetError(
            `表紙の${keyLine}列に費目が存在しません`,
        );
    }
};
