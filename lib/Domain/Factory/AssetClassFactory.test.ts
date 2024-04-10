import { AssetClassResponse, AssetClassFactory } from '.';

test('レスポンスから資産区分を作成', () => {
    const res: AssetClassResponse = {
        id: 1,
        name: '鉄有固-運送施設 建物-鉄骨鉄筋コンクリート造又は鉄筋コンクリート造-停車場建物',
        'account_division': '鉄コン造',
        code: 10000,
        'useful_life': 30,
        category: '建築仕上げ',
        'account_item_moku': '007停留場建物',
        'account_item_kou': '05建物',
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-01').toISOString(),
    };
    const assetClass = AssetClassFactory.createFromResponse(res);
    expect(assetClass.id).toBe(res.id);
    expect(assetClass.name).toBe(res.name);
    expect(assetClass.accountDivision).toBe(res.account_division);
    expect(assetClass.code).toBe(res.code);
    expect(assetClass.usefulLife).toBe(res.useful_life);
    expect(assetClass.category).toBe(res.category);
    expect(assetClass.accountItemMoku).toBe(res.account_item_moku);
    expect(assetClass.accountItemKou).toBe(res.account_item_kou);
    expect(assetClass.createdAt.toISOString()).toBe(res.created_at);
    expect(assetClass.updatedAt.toISOString()).toBe(res.updated_at);
});
