export class ExcelService {
    public static excelDateToJSDate(excelDate: number): Date {
        const date = new Date(
            Math.round((excelDate - (25567 + 1)) * 86400 * 1000),
        );
        const converted_date = date.toISOString().split('T')[0];
        return new Date(converted_date);
    }
}
