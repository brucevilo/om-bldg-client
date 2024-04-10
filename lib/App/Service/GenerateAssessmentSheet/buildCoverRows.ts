import { Assessment } from '@/Domain/ValueObject';
import { Worksheet } from 'exceljs';
import buildGetCell from './buildGetCell';
import isConstruction from './isConstruction';
import setPriceFormat from './setPriceFormat';

const START_ROW_INDEX = 4 as const;
const NAME_ROW_INDEX = START_ROW_INDEX;
const PRICE_ROW_INDEX = START_ROW_INDEX + 1;
const TAX_ROW_INDEX = START_ROW_INDEX + 2;
const CHANGED_PRICE_ROW_INDEX = START_ROW_INDEX + 3;
const CHANGED_TAX_ROW_INDEX = START_ROW_INDEX + 4;
const DIFF_PRICE_ROW_INDEX = START_ROW_INDEX + 5;

const HEADER_COL_INDEX = 'B' as const;
// 工事名称の列だけC列
const NAME_COL_INDEX = 'C' as const;
// 他の金額はすべてF列
const VALUE_COL_INDEX = 'F' as const;

export default function buildCoverRows(
    sheet: Worksheet,
    previousAssessment: Assessment,
    changedAssessment?: Assessment,
): void {
    buildTitle(sheet, previousAssessment, changedAssessment);
    buildFirstContractCoverRows(sheet, previousAssessment);
    if (changedAssessment) {
        buildChangedContractCoverRows(
            sheet,
            previousAssessment,
            changedAssessment,
        );
    }
}

function buildTitle(
    sheet: Worksheet,
    previousAssessment: Assessment,
    changedAssessment?: Assessment,
) {
    const getCell = buildGetCell(sheet);
    const contractIndex = changedAssessment
        ? changedAssessment.contractable.contracts.findIndex(
              c => c.id === changedAssessment.contract.id,
          )
        : 0;
    sheet.mergeCells('C2:F2');
    const titleCell = getCell('C2');
    titleCell.alignment = {
        horizontal: 'center',
    };
    titleCell.font = {
        size: 20,
    };
    const title = (() => {
        const prefix = contractIndex > 0 ? `第${contractIndex}回設計変更` : '';
        if (previousAssessment.contract.constructionId)
            return `${prefix}工事費内訳明細書`;
        if (previousAssessment.contract.designId)
            return `${prefix}業務委託料内訳明細書`;
        throw new Error('査定表のタイトルの出力に失敗しました');
    })();
    titleCell.value = title;
}

/**
 * --- 初回契約(工事 | 設計) ---
 * 1. 工事名称 | 名称
 * 2. 請負代金額 | 業務委託料
 * (うち消費税及び地方消費税相当額)
 */
function buildFirstContractCoverRows(
    sheet: Worksheet,
    previousAssessment: Assessment,
) {
    const getCell = buildGetCell(sheet);
    const getPriceFormattedCell = buildGetCell(sheet, setPriceFormat);
    const nameHeaderCell = getCell(`${HEADER_COL_INDEX}${NAME_ROW_INDEX}`);
    const nameCell = getCell(`${NAME_COL_INDEX}${NAME_ROW_INDEX}`);
    const contractedPriceHeaderCell = getCell(
        `${HEADER_COL_INDEX}${PRICE_ROW_INDEX}`,
    );
    const contractedPriceCell = getPriceFormattedCell(
        `${VALUE_COL_INDEX}${PRICE_ROW_INDEX}`,
    );
    const taxHeaderCell = getCell(`${HEADER_COL_INDEX}${TAX_ROW_INDEX}`);
    const taxCell = getPriceFormattedCell(`${VALUE_COL_INDEX}${TAX_ROW_INDEX}`);
    nameHeaderCell.value = isConstruction(previousAssessment)
        ? '1. 工事名称'
        : '1. 名称';
    nameCell.value = previousAssessment.contractable.name;
    contractedPriceHeaderCell.value = isConstruction(previousAssessment)
        ? '2. 請負代金額'
        : '2. 業務委託料';
    contractedPriceCell.value = previousAssessment.contract.contractedPrice;
    taxHeaderCell.value = '(うち消費税及び地方消費税相当額)';
    taxCell.value = Math.ceil(
        (previousAssessment.contract.contractedPriceWithoutTax || 0) *
            (previousAssessment.contract.taxRate / 100),
    );
}

/**
 * --- 設計変更(工事 | 設計) ---
 * 3. 今回設計変更請負代金額 | 今回設計変更業務委託料
 * (うち消費税及び地方消費税相当額)
 * 4. 差引(増)金額
 */
function buildChangedContractCoverRows(
    sheet: Worksheet,
    previousAssessment: Assessment,
    changedAssessment: Assessment,
) {
    const getCell = buildGetCell(sheet);
    const getPriceFormattedCell = buildGetCell(sheet, setPriceFormat);
    const changedPriceHeaderCell = getCell(
        `${HEADER_COL_INDEX}${CHANGED_PRICE_ROW_INDEX}`,
    );
    const changedPriceCell = getPriceFormattedCell(
        `${VALUE_COL_INDEX}${CHANGED_PRICE_ROW_INDEX}`,
    );
    const changedTaxHeaderCell = getCell(
        `${HEADER_COL_INDEX}${CHANGED_TAX_ROW_INDEX}`,
    );
    const changedTaxCell = getPriceFormattedCell(
        `${VALUE_COL_INDEX}${CHANGED_TAX_ROW_INDEX}`,
    );
    const diffHeaderCell = getCell(
        `${HEADER_COL_INDEX}${DIFF_PRICE_ROW_INDEX}`,
    );
    const diffCell = getPriceFormattedCell(
        `${VALUE_COL_INDEX}${DIFF_PRICE_ROW_INDEX}`,
    );
    changedPriceHeaderCell.value = isConstruction(previousAssessment)
        ? '3. 今回設計変更請負代金額'
        : '3. 今回設計変更業務委託料';
    changedPriceCell.value = changedAssessment.contract.contractedPrice;
    changedTaxHeaderCell.value = '(うち消費税及び地方消費税相当額)';
    changedTaxCell.value = Math.ceil(
        (changedAssessment.contract.contractedPriceWithoutTax || 0) *
            (changedAssessment.contract.taxRate / 100),
    );
    diffHeaderCell.value = '4. 差引(増)金額';
    diffCell.value =
        (changedAssessment.contract.contractedPrice || 0) -
        (previousAssessment.contract.contractedPrice || 0);
}
