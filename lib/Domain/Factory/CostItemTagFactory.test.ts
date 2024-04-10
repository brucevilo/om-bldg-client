import { CostItemTagFactory, CostItemTagResponse } from '.';

test('レスポンスから特定情報を作成', () => {
    const res: CostItemTagResponse = {
        id: 1,
        'cost_item_id': 1,
        name: 'コスモスクエア駅',
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };

    const tag = CostItemTagFactory.createFromResponse(res);
    expect(tag.id).toBe(res.id);
    expect(tag.costItemId).toBe(res.cost_item_id);
    expect(tag.name).toBe(res.name);
    expect(tag.createdAt.toISOString()).toBe(res.created_at);
    expect(tag.updatedAt.toISOString()).toBe(res.updated_at);
});
