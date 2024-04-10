import { ConstructionStatement } from '@/Domain/Entity';
import { sum } from 'lodash';

export class AssetClassDirectExpenseDivideService {
    static calcDivisionRowByConstructionType(
        constructionStatement: ConstructionStatement,
    ): {
        rowNumber: number;
        price: number;
    }[] {
        const 直接工事費 = constructionStatement.costItems
            .filter(ci => ci.isDirectExpence)
            .reduce((total, current) => total + current.price, 0);
        const 直接仮設費 =
            constructionStatement.aggregateCostItemsWithSpecificConstructionType(
                '直接仮設工事',
            );
        const 部分撤去工事 =
            constructionStatement.aggregateCostItemsWithSpecificConstructionType(
                '部分撤去工事',
            );
        const 直接仮設及び部分撤去工事を除く直接工事費 =
            直接工事費 - 直接仮設費 - 部分撤去工事;
        const 費用の直接工事費 = constructionStatement.isAssetClassification
            ? 部分撤去工事
            : 直接工事費;
        const 費用の部分撤去工事 = constructionStatement.isAssetClassification
            ? 部分撤去工事
            : 部分撤去工事;
        const 費用の直接仮設及び部分撤去工事を除く直接工事費 =
            constructionStatement.isAssetClassification
                ? 費用の直接工事費 - 費用の部分撤去工事
                : 費用の直接工事費 - 費用の部分撤去工事 - 直接仮設費;
        const 資産の直接工事費 = constructionStatement.isAssetClassification
            ? 直接工事費 - 費用の直接工事費
            : 0;
        const 資産の部分撤去工事 = constructionStatement.isAssetClassification
            ? 部分撤去工事 - 費用の部分撤去工事
            : 0;
        const 資産の直接仮設及び部分撤去工事を除く直接工事費 =
            constructionStatement.isAssetClassification
                ? 直接仮設及び部分撤去工事を除く直接工事費 -
                  費用の直接仮設及び部分撤去工事を除く直接工事費
                : 0;
        return [
            直接工事費,
            直接仮設費,
            部分撤去工事,
            直接仮設及び部分撤去工事を除く直接工事費,
            資産の直接工事費,
            資産の部分撤去工事,
            資産の直接仮設及び部分撤去工事を除く直接工事費,
            費用の直接工事費,
            費用の部分撤去工事,
            費用の直接仮設及び部分撤去工事を除く直接工事費,
        ].map((expense, index) => ({ rowNumber: index, price: expense }));
    }

    static calcDivisionRowByAllConstructionType(
        constructionStatements: ConstructionStatement[],
        rowNumber: number,
    ): number {
        return sum(
            constructionStatements.map(
                cs =>
                    (
                        this.calcDivisionRowByConstructionType(cs).find(
                            v => v.rowNumber === rowNumber,
                        ) as { rowNumber: number; price: number }
                    ).price,
            ),
        );
    }
}
