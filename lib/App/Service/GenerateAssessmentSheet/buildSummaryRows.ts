import { Assessment } from '@/Domain/ValueObject';
import { Worksheet } from 'exceljs';
import buildGetCell from './buildGetCell';
import isConstruction from './isConstruction';
import setBorder from './setBorder';
import setCenter from './setCenter';
import setPriceFormat from './setPriceFormat';
import { PartSummary } from './types';

/**
 * 査定表のサマリ部を構築
 * 返り値は明細部の開始行 -> （内訳）のところ
 */
export default function buildSummaryRows(
    sheet: Worksheet,
    previousAssessment: Assessment,
    previousPartSummaries: PartSummary[],
    changedAssessment?: Assessment,
    changedPartSummaries?: PartSummary[],
): number {
    buildHeader(sheet, previousAssessment, changedAssessment);
    buildEmptyRow(sheet, changedAssessment);
    let startPartRowIndex = getStartRowIndex(changedAssessment) + 3;
    previousPartSummaries.forEach((previousPartSummary, i) => {
        startPartRowIndex = buildPartRows(
            sheet,
            startPartRowIndex,
            previousPartSummary,
            changedPartSummaries?.[i],
        );
    });
    buildTotalRow(
        sheet,
        startPartRowIndex,
        previousAssessment,
        changedAssessment,
    );
    return startPartRowIndex + 2;
}

/**
 * 設計変更の査定表の場合差額が入るので3行下げる
 */
function getStartRowIndex(changedAssessment?: Assessment) {
    return changedAssessment ? 11 : 8;
}

function buildHeader(
    sheet: Worksheet,
    previousAssessment: Assessment,
    changedAssessment?: Assessment,
) {
    const getHeaderCell = buildGetCell(sheet, setBorder, setCenter);
    const startRowIndex = getStartRowIndex(changedAssessment);
    const summaryTitleCell = sheet.getCell(`B${startRowIndex}`);
    summaryTitleCell.value = isConstruction(previousAssessment)
        ? '請負代金額内訳'
        : '業務委託料内訳';
    const headerRowIndex = startRowIndex + 1;
    const nameHeaderCell = getHeaderCell(`B${headerRowIndex}`);
    nameHeaderCell.value = '工事名称';
    const priceHeaderCell = getHeaderCell(`C${headerRowIndex}`);
    priceHeaderCell.value = '金額';
    if (changedAssessment) buildChangedHeader(sheet, headerRowIndex);
}

function buildChangedHeader(sheet: Worksheet, headerRowIndex: number) {
    const getHeaderCell = buildGetCell(sheet, setBorder, setCenter);
    const currentPriceHeader = getHeaderCell(`D${headerRowIndex}`);
    currentPriceHeader.value = '今回設計変更金額';
    const diffHeader = getHeaderCell(`E${headerRowIndex}`);
    diffHeader.value = '差引金額';
}

function buildEmptyRow(sheet: Worksheet, changedAssessment?: Assessment) {
    const rowIndex = getStartRowIndex(changedAssessment) + 2;
    const targetColIndexes = changedAssessment
        ? ['B', 'C', 'D', 'E']
        : ['B', 'C'];
    const getCell = buildGetCell(sheet, setBorder);
    targetColIndexes.forEach(col => getCell(`${col}${rowIndex}`));
}

/**
 * 金額, 今回設計変更金額
 */
type PartRow = [string, number] | [string, number, number, number] | null[];

function setPartRow(sheet: Worksheet, row: PartRow, rowIndex: number) {
    const getPartNameCell = buildGetCell(sheet, setBorder);
    const getHeaderCell = buildGetCell(sheet, setBorder, setCenter);
    const getPriceCell = buildGetCell(sheet, setBorder, setPriceFormat);
    if (row[0] === null) {
        const cols = ['B', 'C', 'D', 'E'];
        row.forEach((_, i) => {
            getPartNameCell(`${cols[i]}${rowIndex}`);
        });
        return;
    }
    const [header, ...prices] = row;
    const headerCell = ['消費税及び地方消費税相当額', '計', '合計'].includes(
        header,
    )
        ? getHeaderCell(`B${rowIndex}`)
        : getPartNameCell(`B${rowIndex}`);
    headerCell.value = header;
    getPriceCell(`C${rowIndex}`).value = prices[0];
    if (prices.length === 1) return;
    getPriceCell(`D${rowIndex}`).value = prices[1];
    getPriceCell(`E${rowIndex}`).value = prices[2];
}

/**
 * 部ごとにサマリを出力する
 * 返り値は次の部の開始行
 */
function buildPartRows(
    sheet: Worksheet,
    startRowIndex: number,
    previousPartSummary: PartSummary,
    changedPartSummary?: PartSummary,
): number {
    if (changedPartSummary) {
        setPartRow(
            sheet,
            [
                previousPartSummary.part,
                previousPartSummary.subtotal,
                changedPartSummary.subtotal,
                changedPartSummary.subtotal - previousPartSummary.subtotal,
            ],
            startRowIndex,
        );
        setPartRow(
            sheet,
            [
                '消費税及び地方消費税相当額',
                previousPartSummary.tax,
                changedPartSummary.tax,
                changedPartSummary.tax - previousPartSummary.tax,
            ],
            startRowIndex + 1,
        );
        setPartRow(
            sheet,
            [
                '計',
                previousPartSummary.total,
                changedPartSummary.total,
                changedPartSummary.total - previousPartSummary.total,
            ],
            startRowIndex + 2,
        );
        setPartRow(sheet, [null, null, null, null], startRowIndex + 3);
    } else {
        setPartRow(
            sheet,
            [previousPartSummary.part, previousPartSummary.subtotal],
            startRowIndex,
        );
        setPartRow(
            sheet,
            ['消費税及び地方消費税相当額', previousPartSummary.tax],
            startRowIndex + 1,
        );
        setPartRow(sheet, ['計', previousPartSummary.total], startRowIndex + 2);
        setPartRow(sheet, [null, null], startRowIndex + 3);
    }
    return startRowIndex + 4;
}

function buildTotalRow(
    sheet: Worksheet,
    startRowIndex: number,
    previousAssessment: Assessment,
    changedAssessment?: Assessment,
) {
    if (changedAssessment) {
        setPartRow(
            sheet,
            [
                '合計',
                previousAssessment.contract.contractedPrice || 0,
                changedAssessment.contract.contractedPrice || 0,
                (changedAssessment.contract.contractedPrice || 0) -
                    (previousAssessment.contract.contractedPrice || 0),
            ],
            startRowIndex,
        );
    } else {
        setPartRow(
            sheet,
            ['合計', previousAssessment.contract.contractedPrice || 0],
            startRowIndex,
        );
    }
}
