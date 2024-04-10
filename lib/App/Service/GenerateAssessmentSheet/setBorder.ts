import { Cell } from 'exceljs';

export default function setBorder(cell: Cell): void {
    cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };
}
