import { CostItemFactory } from '.';
import {
    dummyCostItemResponse,
    dummyCostItemTagsResponse,
} from '@/__test__/dummy';

test('レスポンスから明細項目を作成', () => {
    const res = dummyCostItemResponse();
    const tags = dummyCostItemTagsResponse();
    const costItem = CostItemFactory.createFromResponse(res);
    expect(costItem.id).toBe(res.id);
    expect(costItem.constructionStatementId).toBe(
        res.construction_statement_id,
    );
    expect(costItem.name).toBe(res.name);
    expect(costItem.code).toBe(res.code);
    expect(costItem.constructionType).toBe(res.construction_type);
    expect(costItem.dimension).toBe(res.dimension);
    expect(costItem.amount).toBe(res.amount);
    expect(costItem.unit).toBe(res.unit);
    expect(costItem.unitPrice).toBe(res.unit_price);
    expect(costItem.price).toBe(res.price);
    expect(costItem.constructionTime).toBe(res.construction_time);
    expect(costItem.transportationTime).toBe(res.transportation_time);
    expect(costItem.remarks).toBe(res.remarks);
    expect(costItem.assetClass?.name).toBe(res.asset_class?.name);
    expect(costItem.assetClass?.code).toBe(res.asset_class?.code);
    expect(costItem.assetClass?.usefulLife).toBe(res.asset_class?.useful_life);
    expect(costItem.assetClass?.category).toBe(res.asset_class?.category);
    expect(costItem.assetClass?.accountItemMoku).toBe(
        res.asset_class?.account_item_moku,
    );
    expect(costItem.assetClass?.accountItemKou).toBe(
        res.asset_class?.account_item_kou,
    );
    expect(costItem.costItemTags[0].id).toBe(tags[0].id);
    expect(costItem.costItemTags[0].costItemId).toBe(tags[0].cost_item_id);
    expect(costItem.costItemTags[0].name).toBe(tags[0].name);
    expect(costItem.createdAt.toISOString()).toBe(res.created_at);
    expect(costItem.updatedAt.toISOString()).toBe(res.updated_at);
});
