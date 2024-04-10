import { Cell } from 'exceljs';

export default function setRight(cell: Cell): void {
    cell.alignment = {
        horizontal: 'right',
    };
}
