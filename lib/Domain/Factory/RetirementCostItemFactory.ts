import { RetirementCostItem } from '@/Domain/Entity';
import { CostItemFactory, CostItemResponse } from './CostItemFactory';
import {
    AssetStatementFactory,
    AssetStatementResponse,
} from './AssetStatementFactory';

export interface RetirementCostItemResponse {
    id: number;
    amount: number;
    price: number;
    cost_item: CostItemResponse;
    asset_statement: AssetStatementResponse;
    retirement_id: 1;
    created_at: string;
    updated_at: string;
}

export class RetirementCostItemFactory {
    static createFromResponseObject(
        res: RetirementCostItemResponse,
    ): RetirementCostItem {
        return new RetirementCostItem(
            res.id,
            res.amount,
            res.price,
            CostItemFactory.createFromResponse(res.cost_item),
            AssetStatementFactory.createFromResponse(res.asset_statement),
            res.retirement_id,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
