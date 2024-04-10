import { Assessment } from '@/Domain/ValueObject';
import { Worksheet } from 'exceljs';
import buildGetCell from './buildGetCell';
import isConstruction from './isConstruction';
import setBorder from './setBorder';
import setCenter from './setCenter';
import setPriceFormat from './setPriceFormat';
import setRight from './setRight';
import setSideAndBottomBorder from './setSideAndBottomBorder';
import setSideBorder from './setSideBorder';
import { PartSummary } from './types';

const Cols = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'] as const;

export default function buildDetailRows(
    sheet: Worksheet,
    startRowIndex: number,
    previousAssessment: Assessment,
    previousPartSummaries: PartSummary[],
    changedAssessment?: Assessment,
    changedPartSummaries?: PartSummary[],
): void {
    buildDetailHeaderRow(sheet, startRowIndex, changedAssessment);
    buildEmptyRow(sheet, startRowIndex + 2, changedAssessment);
    let partRowIndex = startRowIndex + 3;
    previousPartSummaries.forEach((previousPartSummary, i) => {
        partRowIndex = buildPartDetailRows(
            sheet,
            partRowIndex,
            previousAssessment,
            previousPartSummary,
            changedAssessment,
            changedPartSummaries?.[i],
        );
    });
    buildTotalRow(sheet, partRowIndex, previousAssessment, changedAssessment);
}

function buildEmptyRow(
    sheet: Worksheet,
    rowIndex: number,
    changedAssessment?: Assessment,
) {
    const getCell = buildGetCell(sheet, setSideBorder);

    const cols = changedAssessment ? 8 : 6;
    Cols.filter((_, i) => i < cols).forEach(col => {
        getCell(`${col}${rowIndex}`);
    });
}

function buildDetailHeaderRow(
    sheet: Worksheet,
    rowIndex: number,
    changedAssessment?: Assessment,
) {
    sheet.getCell(`B${rowIndex}`).value = '(内訳)';
    const getHeaderCell = buildGetCell(sheet, setCenter, setBorder);
    const headers = changedAssessment
        ? [
              '名称',
              '形状寸法',
              '数量',
              '単位',
              '金額',
              '今回設計変更金額',
              '差引金額',
              '摘要',
          ]
        : ['名称', '形状寸法', '数量', '単位', '金額', '摘要'];
    headers.forEach((header, i) => {
        getHeaderCell(`${Cols[i]}${rowIndex + 1}`).value = header;
    });
}

function buildPartDetailRows(
    sheet: Worksheet,
    startRowIndex: number,
    previousAssessment: Assessment,
    previousPartSummary: PartSummary,
    changedAssessment?: Assessment,
    changedPartSummary?: PartSummary,
): number {
    const getCell = buildGetCell(sheet, setSideBorder);
    const getPriceCell = buildGetCell(sheet, setPriceFormat, setSideBorder);
    const getCenterCell = buildGetCell(sheet, setSideBorder, setCenter);
    buildEmptyRow(sheet, startRowIndex, changedAssessment);
    getCell(`B${startRowIndex}`).value = previousPartSummary.part;
    (changedAssessment || previousAssessment).statements.forEach(
        (statement, i) => {
            const rowIndex = startRowIndex + i + 1;
            getCell(`B${rowIndex}`).value = statement.name;
            getCell(`C${rowIndex}`).value = statement.size;
            getCell(`D${rowIndex}`, setRight).value = statement.amount;
            getCell(`E${rowIndex}`).value = statement.unit;
            const firstPrice =
                previousAssessment.statements.find(
                    s => s.name === statement.name,
                )?.price || 0;
            getPriceCell(`F${rowIndex}`).value = firstPrice;
            if (changedAssessment) {
                getPriceCell(`G${rowIndex}`).value = statement.price;
                getPriceCell(`H${rowIndex}`).value =
                    (statement.price || 0) - firstPrice;
                getCell(`I${rowIndex}`).value = isConstruction(
                    previousAssessment,
                )
                    ? '共通費共'
                    : '諸経費共';
            } else {
                getCell(`G${rowIndex}`).value = isConstruction(
                    previousAssessment,
                )
                    ? '共通費共'
                    : '諸経費共';
            }
        },
    );
    [
        ['小計', previousPartSummary.subtotal, changedPartSummary?.subtotal],
        [
            '消費税及び地方消費税相当額',
            previousPartSummary.tax,
            changedPartSummary?.tax,
        ],
        ['計', previousPartSummary.total, changedPartSummary?.total],
    ].forEach(([key, val, changed], i) => {
        const rowIndex =
            startRowIndex +
            (changedAssessment || previousAssessment).statements.length +
            1 +
            i;
        buildEmptyRow(sheet, rowIndex, changedAssessment);
        getCenterCell(`B${rowIndex}`).value = key;
        getPriceCell(`F${rowIndex}`).value = val;
        if (changed) {
            getPriceCell(`G${rowIndex}`).value = changed;
            getPriceCell(`H${rowIndex}`).value = Number(changed) - Number(val);
        }
    });
    buildEmptyRow(
        sheet,
        startRowIndex +
            (changedAssessment || previousAssessment).statements.length +
            4,
        changedAssessment,
    );
    // part + assessmentStatementの行数 + 小計 + 消費税 + 合計 + 空行
    return (
        startRowIndex +
        (changedAssessment || previousAssessment).statements.length +
        5
    );
}

function buildTotalRow(
    sheet: Worksheet,
    rowIndex: number,
    previousAssessment: Assessment,
    changedAssessment?: Assessment,
) {
    const getCell = buildGetCell(sheet, setSideAndBottomBorder);

    const cols = changedAssessment ? 8 : 6;
    Cols.filter((_, i) => i < cols).forEach(col => {
        getCell(`${col}${rowIndex}`);
    });
    getCell(`B${rowIndex}`, setCenter).value = '合計';
    getCell(`F${rowIndex}`, setPriceFormat).value =
        previousAssessment.contract.contractedPrice || 0;
    if (changedAssessment) {
        getCell(`G${rowIndex}`, setPriceFormat).value =
            changedAssessment.contract.contractedPrice || 0;
        getCell(`H${rowIndex}`, setPriceFormat).value =
            (changedAssessment.contract.contractedPrice || 0) -
            (previousAssessment.contract.contractedPrice || 0);
    }
}
