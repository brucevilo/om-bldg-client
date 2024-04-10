import { RetirementService, RetirementCreateParams } from '@/Domain/Service';
import {
    dummyCostItem,
    dummyAssetStatement,
    dummyRetirementCostItem,
} from '@/__test__/dummy';

test('calcRetirementedSapRecordedPrice isPrivatized=true', () => {
    const retirementCreateParamsArray: RetirementCreateParams[] = [
        {
            costItem: dummyCostItem({
                name: '直接仮設工事',
                price: 10000,
                assetClassId: null,
            }),
            assetStatement: dummyAssetStatement(),
            amount: 2,
        },
        {
            costItem: dummyCostItem({
                name: '直接仮設工事',
                price: 12000,
                assetClassId: null,
            }),
            assetStatement: dummyAssetStatement(),
            amount: 3,
        },
    ];
    const retirementCostItems = [
        dummyRetirementCostItem(),
        dummyRetirementCostItem(),
    ];
    const rate = 0.5;
    const retirementedSapRecordedPrice =
        RetirementService.calcRetirementedSapRecordedPrice(
            retirementCreateParamsArray,
            retirementCostItems,
            rate,
        );
    const sapRecordedPrice = retirementCreateParamsArray[0].assetStatement
        .sapRecordedPrice as number;
    const remainSapRecordedPrice =
        sapRecordedPrice -
        dummyRetirementCostItem().price -
        dummyRetirementCostItem().price;
    const calculatedRetirementedSapRecordedPrice =
        remainSapRecordedPrice -
        Math.floor(
            retirementCreateParamsArray[0].costItem.unitPrice *
                retirementCreateParamsArray[0].amount *
                rate,
        ) -
        Math.floor(
            retirementCreateParamsArray[1].costItem.unitPrice *
                retirementCreateParamsArray[1].amount *
                rate,
        );

    expect(retirementedSapRecordedPrice).toBe(
        calculatedRetirementedSapRecordedPrice,
    );
});

test('calcRemainSapRecordedPrice isPrivatized=false', () => {
    const retirementCreateParamsArray: RetirementCreateParams[] = [
        {
            costItem: dummyCostItem({
                name: '直接仮設工事',
                price: 10000,
                assetClassId: null,
            }),
            assetStatement: dummyAssetStatement(false),
            amount: 2,
        },
        {
            costItem: dummyCostItem({
                name: '直接仮設工事',
                price: 12000,
                assetClassId: null,
            }),
            assetStatement: dummyAssetStatement(false),
            amount: 3,
        },
    ];
    const retirementCostItems = [
        dummyRetirementCostItem(),
        dummyRetirementCostItem(),
    ];
    const rate = 0.5;
    const retirementedSapRecordedPrice =
        RetirementService.calcRetirementedSapRecordedPrice(
            retirementCreateParamsArray,
            retirementCostItems,
            rate,
        );
    const sapRecordedPrice = retirementCreateParamsArray[0].assetStatement
        .sapRecordedPrice as number;
    const remainSapRecordedPrice =
        sapRecordedPrice -
        dummyRetirementCostItem().price -
        dummyRetirementCostItem().price;

    const calculatedRetirementedSapRecordedPrice =
        remainSapRecordedPrice -
        retirementCreateParamsArray[0].costItem.price -
        retirementCreateParamsArray[1].costItem.price;

    expect(retirementedSapRecordedPrice).toBe(
        calculatedRetirementedSapRecordedPrice,
    );
});
