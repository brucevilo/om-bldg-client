import { dummyConstructionStatement, dummyAssetClass } from '@/__test__/dummy';
import { Classification } from '.';

test('資産クラスが紐付いている明細項目の合計金額を工事明細毎に集計', () => {
    const totalPrice = dummyConstructionStatement(
        1,
        Classification.Asset,
    ).aggregateCostItemsWithSpecificAssetClass(dummyAssetClass(1));
    expect(totalPrice).toBe(50000);
});
