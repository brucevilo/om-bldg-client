import { Cell } from 'exceljs';

export default function setCenter(cell: Cell): void {
    cell.alignment = {
        horizontal: 'center',
    };
}
