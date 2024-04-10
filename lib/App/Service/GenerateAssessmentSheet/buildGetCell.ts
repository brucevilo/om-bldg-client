import { Cell, Worksheet } from 'exceljs';

type Formatters = Array<(cell: Cell) => void>;

export default function buildGetCell(
    sheet: Worksheet,
    ...formatters: Formatters
) {
    return (index: string, ...customFormatters: Formatters): Cell => {
        const cell = sheet.getCell(index);
        formatters.forEach(formatter => formatter(cell));
        customFormatters.forEach(formatter => formatter(cell));
        return cell;
    };
}
