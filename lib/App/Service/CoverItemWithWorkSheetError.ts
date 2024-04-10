export class CoverItemWithWorkSheetError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CoverItemWithWorkSheetError';
    }
}
