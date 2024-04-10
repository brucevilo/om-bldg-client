import { Worksheet } from 'exceljs';

export default function buildHeaderRows(
    sheet: Worksheet,
    targetYear: number,
    budgetDivision: number,
): void {
    sheet.getCell('A1').value = 'WBS管理シート';
    sheet.getCell('A2').value = '対象年度';
    sheet.getCell('C2').value = '年度';
    sheet.getCell('A3').value = '予算課';
    sheet.getCell('C3').value = '技．建築課';
    sheet.getCell('A5').value = 'No';
    sheet.getCell('B5').value = '投資区分';
    sheet.getCell('F5').value = 'プロジェクトコード';
    sheet.getCell('H5').value = '財務分類';
    sheet.getCell('I5').value = '工事名称等';
    sheet.getCell('J5').value = 'セグメント';
    sheet.getCell('L5').value = '号線';
    sheet.getCell('N5').value = '駅';
    sheet.getCell('P5').value = '施工課';
    sheet.getCell('R5').value = '勘定コード';
    sheet.getCell('T5').value = '資産クラス';

    // set dynamic target year
    sheet.getCell('V5').value = `${targetYear} 年度`;
    sheet.getCell('AI5').value = `${Number(targetYear) + 1} 年度`;
    sheet.getCell('AJ5').value = `${Number(targetYear) + 2} 年度`;
    sheet.getCell('AK5').value = `${Number(targetYear) + 3} 年度`;
    sheet.getCell('AL5').value = `${Number(targetYear) + 4} 年度`;

    sheet.getCell('AM5').value = '中期合計';
    sheet.getCell('AN5').value = 'WBSコード';
    sheet.getCell('AO5').value = '既存WBSコード';
    sheet.getCell('AP5').value = '予備項目';
    sheet.getCell('AQ5').value = '予備項目';
    sheet.getCell('AR5').value = '予備項目';
    sheet.getCell('B2').value = targetYear;
    sheet.getCell('B3').value = budgetDivision;
    sheet.getCell('B6').value = '大項目';
    sheet.getCell('C6').value = '中項目';
    sheet.getCell('D6').value = '小項目';
    sheet.getCell('E6').value = '国交省報告';
    sheet.getCell('F6').value = 'WBSLv1';
    sheet.getCell('G6').value = '名称';
    sheet.getCell('H6').value = '名称';
    sheet.getCell('J6').value = 'CD';
    sheet.getCell('K6').value = '名称';
    sheet.getCell('L6').value = 'CD';
    sheet.getCell('M6').value = '名称';
    sheet.getCell('N6').value = 'CD';
    sheet.getCell('O6').value = '名称';
    sheet.getCell('P6').value = 'CD';
    sheet.getCell('Q6').value = '名称';
    sheet.getCell('R6').value = 'CD';
    sheet.getCell('S6').value = '名称';
    sheet.getCell('T6').value = 'CD';
    sheet.getCell('U6').value = '名称';
    sheet.getCell('V6').value = '4月';
    sheet.getCell('W6').value = '5月';
    sheet.getCell('X6').value = '6月';
    sheet.getCell('Y6').value = '7月';
    sheet.getCell('Z6').value = '8月';
    sheet.getCell('AA6').value = '9月';
    sheet.getCell('AB6').value = '10月';
    sheet.getCell('AC6').value = '11月';
    sheet.getCell('AD6').value = '12月';
    sheet.getCell('AE6').value = '1月';
    sheet.getCell('AF6').value = '2月';
    sheet.getCell('AG6').value = '3月';
    sheet.getCell('AH6').value = '年度計';
    sheet.getCell('AN6').value = 'Lv2';
    sheet.getCell('AO6').value = 'Lv2まで入力';
    sheet.getCell('AP6').value = '①';
    sheet.getCell('AQ6').value = '②';
    sheet.getCell('AR6').value = '③';
}
