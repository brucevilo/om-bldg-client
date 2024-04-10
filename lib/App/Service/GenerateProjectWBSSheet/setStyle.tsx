import { Alignment, Worksheet } from 'exceljs';

export default function setStyle(sheet: Worksheet): void {
    const START_ROW_INDEX = 7;
    const GRAY = 'f2f2f2';
    const BLUE = 'deeaf6';
    const PEACH = 'fae4d5';

    const wbsColumns = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
    ];
    const monthsAndYearsColumns = [
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AI',
        'AJ',
        'AK',
        'AL',
    ];
    const associatedColumns = ['K', 'M', 'O', 'Q', 'S', 'U'];
    const totalSumColumns = ['AH', 'AM'];

    const headerStyle = {
        border: {
            top: { style: 'thin' as const },
            left: { style: 'thin' as const },
            bottom: { style: 'thin' as const },
            right: { style: 'thin' as const },
        },
        font: {
            name: 'Arial',
            size: 9,
        },
        numFmt: '',
        alignment: {
            horizontal: 'center' as const,
            vertical: 'middle' as const,
        },
        fill: {
            type: 'pattern' as const,
            pattern: 'none' as const,
        },
        protection: {},
    };

    const setMultipleFill = (
        columnName: string,
        color: string,
        isHeader: boolean,
    ) => {
        const style = {
            ...(isHeader && { ...headerStyle }),
            ...(isHeader && { font: { bold: true } }),
            fill: {
                type: 'pattern' as const,
                pattern: 'solid' as const,
                fgColor: { argb: color },
            },
        };

        if (isHeader) {
            const cell = sheet.getCell(columnName);
            cell.style = style;
        } else {
            const column = sheet.getColumn(columnName);
            column.eachCell((cell, rowNumber) => {
                if (rowNumber >= START_ROW_INDEX) cell.style = style;
            });
        }
    };

    const setMultiplePriceFormat = (columnName: string, format: string) => {
        const column = sheet.getColumn(columnName);
        column.eachCell((cell, rowNumber) => {
            if (rowNumber >= START_ROW_INDEX) cell.numFmt = format;
        });
    };

    const setMultipleAlignment = (
        columnName: string,
        format: Partial<Alignment>,
    ) => {
        const column = sheet.getColumn(columnName);
        column.eachCell((cell, rowNumber) => {
            if (rowNumber >= START_ROW_INDEX) cell.alignment = format;
        });
    };

    // title styles
    sheet.getCell('A1').style = {
        ...headerStyle,
        font: { size: 14 },
        alignment: { horizontal: 'left' as const },
    };

    // target year and budget division styles
    ['A2', 'A3'].map(column => {
        setMultipleFill(column, BLUE, true);
    });
    ['B2', 'B3'].map(column => {
        sheet.getCell(`${column}`).style = {
            ...headerStyle,
            font: { size: 12 },
        };
    });

    // common header styles
    wbsColumns.map(column => {
        sheet.getCell(`${column}5`).style = headerStyle;
        sheet.getCell(`${column}6`).style = {
            ...headerStyle,
            font: { bold: true },
        };
        setMultipleFill(`${column}5`, BLUE, true);
        setMultipleFill(`${column}6`, BLUE, true);

        if (monthsAndYearsColumns.includes(column)) {
            setMultipleFill(`${column}5`, PEACH, true);
            setMultipleFill(`${column}6`, PEACH, true);
        }
    });

    // grayed cells
    associatedColumns.map(column => {
        setMultipleFill(column, GRAY, false);
    });

    // blued cells
    totalSumColumns.map(column => {
        setMultipleFill(column, BLUE, false);
    });

    // budgeting cells
    monthsAndYearsColumns.concat(totalSumColumns).map(column => {
        setMultiplePriceFormat(column, '@');
        setMultipleAlignment(column, {
            vertical: 'middle',
            horizontal: 'right',
        });
    });

    // assign height
    sheet.getRow(1).height = 20;
    sheet.getRow(2).height = 20;
    sheet.getRow(3).height = 20;

    // assign width
    sheet.getColumn('A').width = 10;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 15;
    sheet.getColumn('E').width = 15;
    sheet.getColumn('F').width = 15;
    sheet.getColumn('G').width = 30;
    sheet.getColumn('H').width = 25;
    sheet.getColumn('I').width = 30;
    sheet.getColumn('K').width = 20;
    sheet.getColumn('M').width = 20;
    sheet.getColumn('O').width = 20;
    sheet.getColumn('Q').width = 20;
    sheet.getColumn('S').width = 35;
    sheet.getColumn('U').width = 35;
    sheet.getColumn('AH').width = 10;
    sheet.getColumn('AM').width = 20;
    sheet.getColumn('AN').width = 25;
    sheet.getColumn('AO').width = 25;

    // merge columns
    sheet.mergeCells('C3:D3');
    sheet.mergeCells('B5:E5');
    sheet.mergeCells('F5:G5');
    sheet.mergeCells('J5:K5');
    sheet.mergeCells('L5:M5');
    sheet.mergeCells('N5:O5');
    sheet.mergeCells('P5:Q5');
    sheet.mergeCells('R5:S5');
    sheet.mergeCells('T5:U5');
    sheet.mergeCells('V5:AH5');
}
