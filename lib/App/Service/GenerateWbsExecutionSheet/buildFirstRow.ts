import { Worksheet } from 'exceljs';
import {
    alignCenter,
    boldFont,
    defaultBorder,
    defaultFont,
    greenFill,
    lightOrangeFill,
    purpleFill,
} from './cellStyles';

export default function buildFirstRow(sheet: Worksheet): void {
    formatCells(sheet);
    populateCells(sheet);
}

const formatCells = (sheet: Worksheet) => {
    const columns = ['B1', 'L1', 'AB1', 'AD1', 'AI1', 'AP1', 'AT1'];
    sheet.getRow(1).height = 40;

    sheet.mergeCells('L1:P1');
    sheet.mergeCells('AD1:AH1');
    sheet.mergeCells('AP1:AS1');
    sheet.mergeCells('AT1:AW1');

    columns.forEach(column => {
        sheet.getCell(column).numFmt = '';
        sheet.getCell(column).protection = {};
    });

    sheet.getCell('B1').font = { ...boldFont, size: 18 };

    ['L1', 'AD1'].forEach(col => {
        sheet.getCell(col).font = defaultFont;
        sheet.getCell(col).alignment = { ...alignCenter, wrapText: true };

        sheet.getCell(col).fill = purpleFill;
    });

    ['AB1', 'AI1'].forEach(col => {
        sheet.getCell(col).font = {
            ...boldFont,
            size: 14,
            color: { argb: 'ff0000' },
        };
        sheet.getCell(col).alignment = {
            horizontal: 'right',
            vertical: 'bottom',
        };
    });

    sheet.getCell('AP1').fill = greenFill;
    sheet.getCell('AT1').fill = lightOrangeFill;

    ['AP1', 'AT1'].forEach(col => {
        sheet.getCell(col).font = boldFont;
        sheet.getCell(col).alignment = { ...alignCenter, wrapText: true };
        sheet.getCell(col).border = defaultBorder;
    });
};

const populateCells = (sheet: Worksheet) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    sheet.getCell('B1').value =
        '執行管理表（' +
        currentYear +
        '年度' +
        currentMonth +
        '月次）　【技術部(建築)】';
    sheet.getCell(
        'L1',
    ).value = `契約した場合は契約先を入力してください。既契約金額に反映されます。
    　　↓（概算契約などで追加工事があった場合は後契約のため発生した段階で入力）`;
    sheet.getCell('AB1').value = '[千円]';
    sheet.getCell(
        'AD1',
    ).value = `来年23年度、4月・5月のみ金額を記入願います。計画は実績と同じ（自動）
    　　↓　　　　　　↓　　※集計は『投資額の内訳（参考）』シート参照`;
    sheet.getCell('AI1').value = '[千円]';
    sheet.getCell('AP1').value =
        '今月の年度実績（見通し）から年度計画を引いた差額金額が1千万円以上増減がある場合は、『差額記入欄』へ理由を記入ください。　※【 投資のみ 】';
    sheet.getCell('AT1').value =
        '今月の年度実績（見通し）から前月次（REPLACE月）の年度実績（見通し）を引いた差額金額' +
        'が1千万円以上増減がある場合は、『差額記入欄』へ理由を記入ください。　※【 投資のみ 】';
};
