import { Cell } from 'exceljs';

export default function setSideAndBottomBorder(cell: Cell): void {
    cell.border = {
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
    };
}
