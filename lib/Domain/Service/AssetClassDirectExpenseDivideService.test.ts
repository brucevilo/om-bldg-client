import { dummyConstructionStatement } from '@/__test__/dummy';
import { AssetClassDirectExpenseDivideService } from '@/Domain/Service';
import { Classification, CostItem } from '../Entity';
import { ConstructionTypes } from '../ValueObject';
const assetClassificationConstructionStatement = dummyConstructionStatement(
    1,
    Classification.Asset,
);
const costClassificationConstructionStatement = dummyConstructionStatement(
    2,
    Classification.Cost,
);

test('資産である工事1の直接工事費の内訳', () => {
    const 直接工事費 = assetClassificationConstructionStatement.costItems
        .filter(ci => ConstructionTypes.isDirectExpence(ci.constructionType))
        .reduce((total, current) => total + current.price, 0);
    const 直接仮設費 = (
        assetClassificationConstructionStatement.costItems.find(
            ci => ci.constructionType === '直接仮設工事',
        ) as CostItem
    ).price;
    const 部分撤去工事 = (
        assetClassificationConstructionStatement.costItems.find(
            ci => ci.constructionType === '部分撤去工事',
        ) as CostItem
    ).price;
    const 直接仮設及び部分撤去工事を除く直接工事費 =
        直接工事費 - 直接仮設費 - 部分撤去工事;
    const 費用の直接工事費 = 部分撤去工事;
    const 費用の部分撤去工事 = 部分撤去工事;
    const 費用の直接仮設及び部分撤去工事を除く直接工事費 =
        費用の直接工事費 - 費用の部分撤去工事;
    const 資産の直接工事費 = 直接工事費 - 費用の直接工事費;
    const 資産の部分撤去工事 = 部分撤去工事 - 費用の部分撤去工事;
    const 資産の直接仮設及び部分撤去工事を除く直接工事費 =
        直接仮設及び部分撤去工事を除く直接工事費 -
        費用の直接仮設及び部分撤去工事を除く直接工事費;

    const actualResult = (rowNumber: number) =>
        AssetClassDirectExpenseDivideService.calcDivisionRowByConstructionType(
            assetClassificationConstructionStatement,
        ).find(v => v.rowNumber === rowNumber)?.price;
    expect(直接工事費).toBe(actualResult(0));
    expect(直接仮設費).toBe(actualResult(1));
    expect(部分撤去工事).toBe(actualResult(2));
    expect(直接仮設及び部分撤去工事を除く直接工事費).toBe(actualResult(3));
    expect(資産の直接工事費).toBe(actualResult(4));
    expect(資産の部分撤去工事).toBe(actualResult(5));
    expect(資産の直接仮設及び部分撤去工事を除く直接工事費).toBe(
        actualResult(6),
    );
    expect(費用の直接工事費).toBe(actualResult(7));
    expect(費用の部分撤去工事).toBe(actualResult(8));
    expect(費用の直接仮設及び部分撤去工事を除く直接工事費).toBe(
        actualResult(9),
    );
});

test('費用である工事2の直接工事費の内訳', () => {
    const 直接工事費 = costClassificationConstructionStatement.costItems
        .filter(ci => ci.isDirectExpence)
        .reduce((total, current) => total + current.price, 0);
    const 直接仮設費 = (
        costClassificationConstructionStatement.costItems.find(
            ci => ci.constructionType === '直接仮設工事',
        ) as CostItem
    ).price;
    const 部分撤去工事 = (
        costClassificationConstructionStatement.costItems.find(
            ci => ci.constructionType === '部分撤去工事',
        ) as CostItem
    ).price;
    const 直接仮設及び部分撤去工事を除く直接工事費 =
        直接工事費 - 直接仮設費 - 部分撤去工事;
    const 費用の直接工事費 = 直接工事費;
    const 費用の部分撤去工事 = 部分撤去工事;
    const 費用の直接仮設及び部分撤去工事を除く直接工事費 =
        費用の直接工事費 - 費用の部分撤去工事 - 直接仮設費;
    const 資産の直接工事費 = 0;
    const 資産の部分撤去工事 = 0;
    const 資産の直接仮設及び部分撤去工事を除く直接工事費 = 0;

    const actualResult = (rowNumber: number) =>
        AssetClassDirectExpenseDivideService.calcDivisionRowByConstructionType(
            costClassificationConstructionStatement,
        ).find(v => v.rowNumber === rowNumber)?.price;
    expect(直接工事費).toBe(actualResult(0));
    expect(直接仮設費).toBe(actualResult(1));
    expect(部分撤去工事).toBe(actualResult(2));
    expect(直接仮設及び部分撤去工事を除く直接工事費).toBe(actualResult(3));
    expect(資産の直接工事費).toBe(actualResult(4));
    expect(資産の部分撤去工事).toBe(actualResult(5));
    expect(資産の直接仮設及び部分撤去工事を除く直接工事費).toBe(
        actualResult(6),
    );
    expect(費用の直接工事費).toBe(actualResult(7));
    expect(費用の部分撤去工事).toBe(actualResult(8));
    expect(費用の直接仮設及び部分撤去工事を除く直接工事費).toBe(
        actualResult(9),
    );
});
