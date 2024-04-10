import { MergeCostItems } from '.';
import { Classification, AssetStatement } from '../Entity';
import {
    dummyAssetStatement,
    dummyConstruction,
    dummyConstructionStatement,
    dummyContract,
    dummyCostItem,
} from '@/__test__/dummy';

test('資産化する資産明細などの数量と金額を足し合わせるケース、第一と都合で一つに絞れたケース', () => {
    const newCostItem1 = dummyCostItem({
        name: 'test_meisai',
        constructionType: '金属工事',
        price: 5000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: null,
        amount: 5,
        unitPrice: 1000,
        code: 111111,
    });
    const beforeCostItem1 = dummyCostItem({
        name: 'test_meisai',
        constructionType: '金属工事',
        price: 10000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: 1,
        amount: 10,
        unitPrice: 1000,
        code: 111111,
    });
    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(15);
    expect(mergedCostItems[0].price).toBe(15000);
    expect(mergedCostItems.length).toBe(1);
});
test('共通仮設費や直接仮設工事など、突合したときに数量をいじらずに金額のみを足し合わせるケース', () => {
    const newCostItem1 = dummyCostItem({
        name: '率算出共通仮設費',
        constructionType: '共通仮設費',
        price: 5000,
        assetClassId: 2,
        constructionTime: '',
        transportationTime: '',
        id: 10,
        amount: 1,
        unitPrice: 5000,
        code: 111111,
        dimension: '',
        unit: '式',
    });
    const beforeCostItem1 = dummyCostItem({
        name: '率算出共通仮設費',
        constructionType: '共通仮設費',
        price: 20000,
        assetClassId: 2,
        constructionTime: '',
        transportationTime: '',
        id: 1,
        amount: 1,
        unitPrice: 1000,
        code: 111111,
        dimension: '',
        unit: '式',
    });

    const newCostItem2 = dummyCostItem({
        name: '墨出し',
        constructionType: '共通仮設費',
        price: 10000,
        assetClassId: 1,
        constructionTime: '',
        transportationTime: '',
        id: 11,
        amount: 1,
        unitPrice: 10000,
        code: null,
        unit: '式',
        dimension: '',
    });
    const beforeCostItem2 = dummyCostItem({
        name: '墨出し',
        constructionType: '共通仮設費',
        price: 20000,
        assetClassId: 1,
        constructionTime: '',
        transportationTime: '',
        id: 2,
        amount: 1,
        unitPrice: 20000,
        code: null,
        unit: '式',
        dimension: '',
    });
    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1, beforeCostItem2];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1, newCostItem2],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(1);
    expect(mergedCostItems[0].price).toBe(25000);
    expect(mergedCostItems[1].amount).toBe(1);
    expect(mergedCostItems[1].price).toBe(30000);
    expect(mergedCostItems.length).toBe(2);
});
test('最初の突合で突合される旧明細が一つに絞れず、２回目の突合で一つに絞れたケース', () => {
    const newCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 100000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 10,
        amount: 20,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });

    const newCostItem2 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 10000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 11,
        amount: 2,
        unitPrice: 5000,
        code: 601,
        dimension: 'test_dimension',
        unit: 'ヶ所',
        remarks: 'メモ',
    });
    const beforeCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 200000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 8,
        amount: 40,
        unitPrice: 5000,
        code: 601,
        dimension: 'test_dimension',
        unit: 'ヶ所',
        remarks: 'メモ',
    });
    const beforeCostItem2 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 300000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 9,
        amount: 60,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });
    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1, beforeCostItem2];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1, newCostItem2],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(80);
    expect(mergedCostItems[0].price).toBe(400000);
    expect(mergedCostItems[1].amount).toBe(42);
    expect(mergedCostItems[1].price).toBe(210000);
    expect(mergedCostItems.length).toBe(2);
});
test('最初の突合でも２回目の突合で絞っても２個以上の候補がでたケース', () => {
    const newCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 5000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 1,
        amount: 1,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });

    const newCostItem2 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 100000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 2,
        amount: 20,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });
    const beforeCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 100000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 3,
        amount: 200,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });
    const beforeCostItem2 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 1000000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 4,
        amount: 2000,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });

    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1, beforeCostItem2];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1, newCostItem2],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(201);
    expect(mergedCostItems[0].price).toBe(105000);
    expect(mergedCostItems[1].amount).toBe(2020);
    expect(mergedCostItems[1].price).toBe(1100000);
    expect(mergedCostItems.length).toBe(2);
});
test('最初の突合で絞れずに、２回目の突合の時に絞った結果0個になってしまったケース', () => {
    const newCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 5000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 1,
        amount: 1,
        unitPrice: 5000,
        code: 601,
        dimension: 'test_dimension',
        unit: 'ヶ所',
        remarks: 'test_remarks',
    });

    const newCostItem2 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 100000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 2,
        amount: 20,
        unitPrice: 5000,
        code: 601,
        dimension: 'test_dimension2',
        unit: 'ヶ所',
        remarks: 'test_remarks2',
    });
    const beforeCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 100000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 3,
        amount: 200,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });
    const beforeCostItem2 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 1000000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 4,
        amount: 2000,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });

    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1, beforeCostItem2];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1, newCostItem2],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(201);
    expect(mergedCostItems[0].price).toBe(105000);
    expect(mergedCostItems[1].amount).toBe(2020);
    expect(mergedCostItems[1].price).toBe(1100000);
    expect(mergedCostItems.length).toBe(2);
});

test('突合できなかったケース', () => {
    const newCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部',
        constructionType: '金属工事',
        price: 5000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 1,
        amount: 1,
        unitPrice: 5000,
        code: 601,
        dimension: 'test_dimension',
        unit: 'ヶ所',
        remarks: 'test_remarks',
    });
    const beforeCostItem1 = dummyCostItem({
        name: '運転手・車掌扉開口部2',
        constructionType: '金属工事',
        price: 100000,
        assetClassId: 2,
        constructionTime: '4A',
        transportationTime: '4A',
        id: 3,
        amount: 200,
        unitPrice: 5000,
        code: 601,
        dimension: 'SUSL6.0　L1100×H150',
        unit: 'ヶ所',
        remarks: '見) ㈱佐渡島',
    });

    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(1);
    expect(mergedCostItems[0].price).toBe(5000);
    expect(mergedCostItems[1].amount).toBe(200);
    expect(mergedCostItems[1].price).toBe(100000);
    expect(mergedCostItems.length).toBe(2);
});
test('マージされた資産明細のidとマージ前の金額を、マージ後の資産明細が保持している', () => {
    const newCostItem1 = dummyCostItem({
        name: 'test_meisai',
        constructionType: '金属工事',
        price: 5000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: null,
        amount: 5,
        unitPrice: 1000,
        code: 111111,
    });
    const beforeCostItem1 = dummyCostItem({
        name: 'test_meisai',
        constructionType: '金属工事',
        price: 10000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: 1,
        amount: 10,
        unitPrice: 1000,
        code: 111111,
    });
    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1];
    const assetStatements: AssetStatement[] = [];

    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1],
        dummyConstruction(),
        assetStatements,
        false,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(15);
    expect(mergedCostItems[0].price).toBe(15000);
    expect(mergedCostItems[0].mergedCostItemId).toBe(1);
    expect(mergedCostItems.length).toBe(1);
});
test('第一回設計変更の時は、元設計の明細項目が按分される', () => {
    const newCostItem1 = dummyCostItem({
        name: 'test_meisai',
        constructionType: '金属工事',
        price: 5000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: null,
        amount: 5,
        unitPrice: 1000,
        code: 111111,
    });
    const beforeCostItem1 = dummyCostItem({
        name: 'test_meisai',
        constructionType: '金属工事',
        price: 3000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: 1,
        amount: 3,
        unitPrice: 1000,
        code: 111111,
    });
    const beforeCostItem2 = dummyCostItem({
        name: '一般管理費等',
        constructionType: '一般管理費等',
        price: 10000,
        assetClassId: 1,
        constructionTime: '1A',
        transportationTime: '1A',
        id: 2,
        amount: 1,
        unitPrice: 10000,
        code: 111111,
    });
    const constructionStatement = dummyConstructionStatement(
        1,
        Classification.Asset,
    );
    constructionStatement.costItems = [beforeCostItem1, beforeCostItem2];
    const assetStatement = dummyAssetStatement();
    assetStatement.assessmentPrice = 10000;
    const assetStatements: AssetStatement[] = [assetStatement];
    const construction = dummyConstruction();
    construction.contracts = [dummyContract(), dummyContract()];
    const mergedCostItems = new MergeCostItems(
        constructionStatement,
        [newCostItem1],
        construction,
        assetStatements,
        true,
    ).invoke();

    expect(mergedCostItems[0].amount).toBe(8);
    expect(mergedCostItems[0].price).toBe(6000);
    expect(mergedCostItems[1].amount).toBe(1);
    expect(mergedCostItems[1].price).toBe(9000);
    expect(mergedCostItems.length).toBe(2);
});
