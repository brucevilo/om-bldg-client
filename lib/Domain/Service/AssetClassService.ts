import { ConstructionStatement, AssetClass } from '@/Domain/Entity';
import { assertsIsExists } from '@/Infrastructure';
import { EstimationItem } from '../ValueObject';

const isNotNull = (assetClass: AssetClass | null): assetClass is AssetClass => {
    return assetClass !== null;
};

export class AssetClassService {
    // 資産クラスの"項"単位で集計するために、工事明細に紐づく資産クラスの"項"を配列で返す
    static accountItemKousAssocitingWithCostItem(
        constructionStatements: ConstructionStatement[],
    ): string[] {
        return Array.from(
            new Set(
                constructionStatements
                    .map(cs => cs.costItems)
                    .flat()
                    .map(ci => ci.assetClass)
                    .filter(isNotNull)
                    .map(ac => ac.accountItemKou),
            ),
        );
    }

    public static getCostAssetClass(assetClasses: AssetClass[]): AssetClass {
        const costAssetClass = assetClasses.find(
            ac => ac.accountDivision === '費用',
        );
        assertsIsExists(costAssetClass, '資産クラスマスタに費用が存在しません');
        return costAssetClass;
    }

    public static resolveAssetClass(
        assetClasses: AssetClass[],
        estimationItem: Pick<EstimationItem, 'assetClassInfo'>,
    ): AssetClass | undefined {
        return estimationItem.assetClassInfo === '費用'
            ? AssetClassService.getCostAssetClass(assetClasses)
            : estimationItem.assetClassInfo === '建物'
            ? assetClasses.find(ac => ac.accountItemKou === '05建物')
            : assetClasses.find(
                  ac =>
                      ac.accountDivision
                          .split(',')
                          .includes(estimationItem.assetClassInfo) ||
                      ac.category === estimationItem.assetClassInfo,
              );
    }
}
