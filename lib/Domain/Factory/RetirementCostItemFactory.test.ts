import { RetirementCostItemFactory, RetirementCostItemResponse } from './';
import {
    dummyCostItemResponse,
    dummyAssetStatementResponse,
} from '@/__test__/dummy';

it('create from response', () => {
    const res: RetirementCostItemResponse = {
        id: 1,
        amount: 30,
        price: 200000,
        cost_item: dummyCostItemResponse(),
        asset_statement: dummyAssetStatementResponse(),
        retirement_id: 1,
        created_at: new Date('2020-01-01').toISOString(),
        updated_at: new Date('2020-10-10').toISOString(),
    };
    const retirementCostItem =
        RetirementCostItemFactory.createFromResponseObject(res);
    expect(retirementCostItem.id).toBe(res.id);
    expect(retirementCostItem.amount).toBe(res.amount);
    expect(retirementCostItem.price).toBe(res.price);
    expect(retirementCostItem.costItem.id).toBe(res.cost_item.id);
    expect(retirementCostItem.assetStatement.id).toBe(res.asset_statement.id);
    expect(retirementCostItem.retirement_id).toBe(res.retirement_id);
    expect(retirementCostItem.createdAt.toISOString()).toBe(res.created_at);
    expect(retirementCostItem.updatedAt.toISOString()).toBe(res.updated_at);
});
