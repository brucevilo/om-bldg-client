import { Cell } from 'exceljs';

export default function setSideBorder(cell: Cell): void {
    cell.border = {
        left: { style: 'thin' },
        right: { style: 'thin' },
    };
}
