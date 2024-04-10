import { Cell } from 'exceljs';

export default function setPriceFormat(cell: Cell): Cell {
    cell.numFmt = '¥#,##0-';
    cell.alignment = {
        horizontal: 'right',
    };
    return cell;
}
