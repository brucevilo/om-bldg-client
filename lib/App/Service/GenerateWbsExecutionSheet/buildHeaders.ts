import { Worksheet } from 'exceljs';
import {
    defaultBorder,
    alignCenter,
    darkGrayFill,
    boldFont,
    greenFill,
    lightOrangeFill,
} from './cellStyles';

export default function buildHeaders(
    sheet: Worksheet,
    target_year: number,
    columns: Array<string>,
): void {
    formatCells(sheet, columns);
    populateCells(sheet, target_year);
}

const formatCells = (sheet: Worksheet, columns: Array<string>) => {
    sheet.getRow(2).height = 30;

    columns.forEach(column => {
        const cell = sheet.getCell(`${column}2`);

        // fill
        if (['AP', 'AQ', 'AR', 'AS'].includes(column)) {
            cell.fill = greenFill;
        } else if (['AT', 'AU', 'AV', 'AW'].includes(column)) {
            cell.fill = lightOrangeFill;
        } else if (!['A', 'AN', 'AO'].includes(column)) {
            cell.fill = darkGrayFill;
        }

        // border
        if (['AQ', 'AR', 'AS', 'AU', 'AV', 'AW'].includes(column)) {
            cell.border = defaultBorder;
        } else {
            cell.border = {
                ...defaultBorder,
                bottom: {},
            };
        }

        cell.font = boldFont;
        cell.numFmt = '';
        cell.protection = {};
        cell.alignment = alignCenter;
    });
};

const populateCells = (sheet: Worksheet, target_year: number) => {
    sheet.getCell('B2').value = '番号';
    sheet.getCell('C2').value = 'key';
    sheet.getCell('D2').value = 'プロジェクト名称';
    sheet.getCell('E2').value = 'PJ番号';
    sheet.getCell('F2').value = '財務分類';
    sheet.getCell('G2').value = '工事名称等';
    sheet.getCell('H2').value = '予算科目';
    sheet.getCell('I2').value = '予算掌理部';
    sheet.getCell('J2').value = '発注課';
    sheet.getCell('K2').value = '入力担当者';
    sheet.getCell('L2').value = '契約先';
    sheet.getCell('M2').value = '契約日';
    sheet.getCell('N2').value = '完成日';
    sheet.getCell('O2').value = '検収日';
    sheet.getCell('P2').value = '4月';
    sheet.getCell('Q2').value = '5月';
    sheet.getCell('R2').value = '6月';
    sheet.getCell('S2').value = '7月';
    sheet.getCell('T2').value = '8月';
    sheet.getCell('U2').value = '9月';
    sheet.getCell('V2').value = '10月';
    sheet.getCell('W2').value = '11月';
    sheet.getCell('X2').value = '12月';
    sheet.getCell('Y2').value = '1月';
    sheet.getCell('Z2').value = '2月';
    sheet.getCell('AA2').value = '3月';
    sheet.getCell('AB2').value = `${target_year} 年度`;
    sheet.getCell('AC2').value = `${target_year + 1} 年度`;
    sheet.getCell('AD2').value = `${target_year + 1} 年度
    4月`;
    sheet.getCell('AE2').value = `${target_year + 1} 年度
    5月`;
    sheet.getCell('AF2').value = '予備';
    sheet.getCell('AG2').value = `${target_year + 2} 年度`;
    sheet.getCell('AH2').value = `${target_year + 3} 年度`;
    sheet.getCell('AI2').value = '23-25合計';
    sheet.getCell('AJ2').value = 'ＷＢＳコード';
    sheet.getCell('AK2').value = '事業コード';
    sheet.getCell('AL2').value = '種別';
    sheet.getCell('AM2').value = '予算種別';
    sheet.getCell('AP2').value = '差額１';
    sheet.getCell('AQ2').value = '差額表示１';
    sheet.getCell('AR2').value = '理由選択１';
    sheet.getCell('AS2').value = '理由詳細１';
    sheet.getCell('AT2').value = '差額２';
    sheet.getCell('AU2').value = '差額表示２';
    sheet.getCell('AV2').value = '理由選択２';
    sheet.getCell('AW2').value = '理由詳細２';
};
