import { CostItemService } from '@/Domain/Service';
import { dummyCostItem, dummyContract } from '@/__test__/dummy';

test('buildSearchParams', () => {
    const urlSearchParams = CostItemService.buildSearchParams({
        tagNames: ['testTag1', 'testTag2'],
        costItemNames: ['testCostItem1', 'testCostItem2'],
        constructionId: 1,
        isAsset: true,
        assetClassName: 'testClassName',
        page: 1,
    });

    expect(urlSearchParams.get('asset_class_id_not_null')).toBe('1');
    expect(urlSearchParams.get('asset_class_account_division_not_eq')).toBe(
        '費用',
    );
    expect(
        urlSearchParams.get('construction_statement_construction_id_eq'),
    ).toBe('1');
    expect(urlSearchParams.getAll('cost_item_tags_name_cont_all[]')).toContain(
        'testTag1',
    );
    expect(urlSearchParams.getAll('cost_item_tags_name_cont_all[]')).toContain(
        'testTag2',
    );
    expect(urlSearchParams.getAll('name_cont_all[]')).toContain(
        'testCostItem1',
    );
    expect(urlSearchParams.getAll('name_cont_all[]')).toContain(
        'testCostItem2',
    );
    expect(urlSearchParams.get('page')).toBe('1');
    expect(urlSearchParams.get('asset_class_name_eq')).toBe('testClassName');
});

test('calcContractAtCostItemPrice 民営化後', () => {
    const contract = dummyContract();
    const costItem = dummyCostItem({
        name: '直接仮設工事',
        price: 10000,
        assetClassId: 1,
    });

    const contractAtCostItemPrice = CostItemService.calcContractAtCostItemPrice(
        costItem,
        contract,
    );
    expect(contractAtCostItemPrice).toBe(5000);
});

test('calcContractAtCostItemPrice 民営化前', () => {
    const contract = dummyContract(false);
    const costItem = dummyCostItem({
        name: '直接仮設工事',
        price: 10000,
        assetClassId: 1,
    });

    const contractAtCostItemPrice = CostItemService.calcContractAtCostItemPrice(
        costItem,
        contract,
    );
    expect(contractAtCostItemPrice).toBe(10000);
});
