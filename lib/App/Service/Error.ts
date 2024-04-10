export class CheckAssetClassCodeNoneError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CheckAssetClassCodeNoneError';
    }
}
