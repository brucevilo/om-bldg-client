export class ContractRate {
    // contractのrateDown4に合わせたい
    constructor(
        public expectedPriceWithTax: number,
        public contractedPrice: number,
    ) {}

    get value(): number {
        return (
            Math.floor(
                (this.contractedPrice / this.expectedPriceWithTax) * 1000,
            ) / 1000
        );
    }
}
