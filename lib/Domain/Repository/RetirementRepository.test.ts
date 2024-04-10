import { RetirementService } from '@/Domain/Service';
import { dummyCostItem, dummyAssetStatement } from '@/__test__/dummy';

test('buildRetirementCreateRequest', () => {
    const costItem = dummyCostItem({
        name: 'タイル工事',
        price: 10000000,
        assetClassId: null,
    });
    const assetStatement = dummyAssetStatement();
    const retirementCreateRequest =
        RetirementService.buildRetirementCreateRequest(
            1,
            '2020-10-10',
            [
                {
                    costItem,
                    assetStatement,
                    amount: 10,
                },
            ],
            0.9,
        );

    const data = retirementCreateRequest.data;
    if (!data) {
        throw new Error();
    }

    expect(data[0].cost_item_id).toBe(costItem.id);
    expect(data[0].asset_statement_id).toBe(assetStatement.id);
    expect(data[0].amount).toBe(10);
    expect(data[0].price).toBe(costItem.unitPrice * 10 * 0.9);
    expect(retirementCreateRequest.construction_statement_id).toBe(1);
    expect(retirementCreateRequest.retiremented_at).toBe('2020-10-10');
});

test('buildRetirementCreateRequest 民営化前', () => {
    const costItem = dummyCostItem({
        name: 'タイル工事',
        price: 10000000,
        assetClassId: null,
    });
    const assetStatement = dummyAssetStatement(false);
    const retirementCreateRequest =
        RetirementService.buildRetirementCreateRequest(
            1,
            '2020-10-10',
            [
                {
                    costItem,
                    assetStatement,
                    amount: 10,
                },
            ],
            0.9,
        );

    const data = retirementCreateRequest.data;
    if (!data) {
        throw new Error();
    }

    expect(data[0].cost_item_id).toBe(costItem.id);
    expect(data[0].asset_statement_id).toBe(assetStatement.id);
    expect(data[0].amount).toBe(39.7);
    expect(data[0].price).toBe(costItem.price);
});
