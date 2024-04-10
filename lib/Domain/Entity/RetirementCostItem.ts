import { CostItem, AssetStatement } from './';

export class RetirementCostItem {
    constructor(
        public id: number,
        public amount: number,
        public price: number,
        public costItem: CostItem,
        public assetStatement: AssetStatement,
        public retirement_id: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
