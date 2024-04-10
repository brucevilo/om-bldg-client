import XLSX, { utils as xlsxUtils } from 'xlsx';
import { assertsIsExists } from './Assertion';
export * from 'xlsx';
import { DateTime } from 'luxon';

export class Excel {
    static async read(file: File): Promise<XLSX.WorkBook> {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = e => {
                try {
                    assertsIsExists(e.target);
                    const data = new Uint8Array(e.target.result as ArrayBuffer);
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellDates: true,
                    });
                    resolve(workbook);
                } catch (e) {
                    reject(e);
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    static downloadXlsm(blob: Blob, filename: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
    }
}

export const utils = {
    ...xlsxUtils,
    convertExcelDateToJSDate(serial: number): Date {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);

        const fractional_day = serial - Math.floor(serial) + 0.0000001;

        let total_seconds = Math.floor(86400 * fractional_day);

        const seconds = total_seconds % 60;

        total_seconds -= seconds;

        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;

        return new Date(
            date_info.getFullYear(),
            date_info.getMonth(),
            date_info.getDate(),
            hours,
            minutes,
            seconds,
        );
    },
};

// sheet_to_jsonでコンバートされた日付型はUTC時間で取り込まれてそのあとJstになっているので、9時間前の日付になっているので修正
export function excelConvertedDateToJst(date: Date): Date {
    const dateTime = DateTime.fromJSDate(date);

    return dateTime.plus({ hours: 9 }).toJSDate();
}
