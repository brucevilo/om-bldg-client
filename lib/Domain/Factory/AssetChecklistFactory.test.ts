import { AssetChecklistResponse, AssetChecklistFactory } from '.';

test('レスポンスから現物照合を作成', () => {
    const res: AssetChecklistResponse = {
        id: 1,
        user_id: 1,
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };
    const assetChecklist = AssetChecklistFactory.createFromResponse(res);
    expect(assetChecklist.id).toBe(res.id);
    expect(assetChecklist.userId).toBe(res.user_id);
    expect(assetChecklist.createdAt.toISOString()).toBe(res.created_at);
    expect(assetChecklist.updatedAt.toISOString()).toBe(res.updated_at);
});
