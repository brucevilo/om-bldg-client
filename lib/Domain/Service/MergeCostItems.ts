import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import {
    AssetStatement,
    Construction,
    ConstructionStatement,
    Contract,
    CostItem,
} from '../Entity';
import { ConstructionType } from '@/Domain/ValueObject';
import { notDirectConstructionPrices } from '@/App/Service/ConstructionTypeService';
import { cloneDeep } from 'lodash';

/**
 * 設計変更時に同一の明細を合算する
 */
export class MergeCostItems {
    constructor(
        private beforeConstructionStatement: ConstructionStatement,
        private newCostItems: CostItem[],
        private construction: Construction,
        private assetStatements: AssetStatement[],
        private isFirstContractChanged: boolean,
    ) {}

    public invoke(): CostItem[] {
        /**
         * 初回の設計変更時のみcalcCurrentCostItemPricesを行う、
         * ２回目以降は既存のCostItemがcalcCurrentCostItemPricesされているので不要
         */
        let beforeCostItemsOnAdjustedPrice = !this.isFirstContractChanged
            ? this.beforeConstructionStatement.costItems
            : MergeCostItems.proratePreviewCostItemPrices(
                  this.beforeConstructionStatement.costItems,
                  this.construction.contracts[0],
                  this.assetStatements,
                  this.beforeConstructionStatement,
              );

        const mergedCostItems = this.newCostItems.map(newItem => {
            const firstMatchedBeforeCostItems =
                beforeCostItemsOnAdjustedPrice.filter(item =>
                    this.firstMatch(item, newItem),
                );
            if (firstMatchedBeforeCostItems.length === 0) {
                return newItem;
            }
            if (firstMatchedBeforeCostItems.length === 1) {
                beforeCostItemsOnAdjustedPrice =
                    beforeCostItemsOnAdjustedPrice.filter(
                        item => item.id !== firstMatchedBeforeCostItems[0].id,
                    );
                return this.mergeCostItem(
                    firstMatchedBeforeCostItems[0],
                    newItem,
                );
            }

            const secondMatchedBeforeCostItems =
                beforeCostItemsOnAdjustedPrice.filter(item =>
                    this.secondMatch(item, newItem),
                );
            if (secondMatchedBeforeCostItems.length === 1) {
                beforeCostItemsOnAdjustedPrice =
                    beforeCostItemsOnAdjustedPrice.filter(
                        item => item.id !== secondMatchedBeforeCostItems[0].id,
                    );
                return this.mergeCostItem(
                    secondMatchedBeforeCostItems[0],
                    newItem,
                );
            }
            beforeCostItemsOnAdjustedPrice =
                beforeCostItemsOnAdjustedPrice.filter(
                    item => item.id !== firstMatchedBeforeCostItems[0].id,
                );

            return this.mergeCostItem(firstMatchedBeforeCostItems[0], newItem);
        });
        return mergedCostItems.concat(beforeCostItemsOnAdjustedPrice);
    }

    // 最初の突合 これで突合できない場合(2つ以上の候補が出てきた)はsecondMatchで突合する
    private firstMatch(beforeCostItem: CostItem, newCostItem: CostItem) {
        if (beforeCostItem.name !== newCostItem.name) return false;
        if (beforeCostItem.constructionType !== newCostItem.constructionType)
            return false;
        if (
            beforeCostItem.constructionTime.toString() !== // @TODO たまにnumber型で入ってくる問題、後でエクセル確認
            newCostItem.constructionTime.toString()
        )
            return false;
        if (
            beforeCostItem.transportationTime.toString() !== // @TODO たまにnumber型で入ってくる問題、後でエクセル確認
            newCostItem.transportationTime.toString()
        )
            return false;
        if (beforeCostItem.code !== newCostItem.code) return false;

        return true;
    }

    // これでも突合できない(突合結果が2以上)場合は、firstMatchの結果の配列の１つ目を利用する
    private secondMatch(beforeCostItem: CostItem, newCostItem: CostItem) {
        if (beforeCostItem.name !== newCostItem.name) return false;
        if (beforeCostItem.dimension !== newCostItem.dimension) return false;
        if (beforeCostItem.remarks !== newCostItem.remarks) return false;
        if (beforeCostItem.constructionType !== newCostItem.constructionType)
            return false;
        if (
            beforeCostItem.constructionTime.toString() !== // @TODO たまにnumber型で入ってくる問題、データベースの型がstringのため
            newCostItem.constructionTime.toString()
        )
            return false;
        if (
            beforeCostItem.transportationTime.toString() !== // @TODO たまにnumber型で入ってくる問題、データベースの型がstringのため
            newCostItem.transportationTime.toString()
        )
            return false;

        return true;
    }

    private mergeCostItem(
        beforeCostItemOnAdjustPrice: CostItem,
        _newCostItem: CostItem,
    ) {
        const newCostItem = cloneDeep(_newCostItem);
        if (
            !this.beforeConstructionStatement.isCollateral && // @TODO 付帯工事については考慮せずに変更した
            !_newCostItem.isUnitPriceEqualPrice()
        ) {
            newCostItem.price += beforeCostItemOnAdjustPrice.price;
            newCostItem.amount += beforeCostItemOnAdjustPrice.amount;
        } else {
            newCostItem.price += beforeCostItemOnAdjustPrice.price;
            newCostItem.unitPrice = newCostItem.price;
        }

        newCostItem.mergedCostItemId = beforeCostItemOnAdjustPrice.id;
        return newCostItem;
    }

    /**
     * 設計変更後の場合、
     * 前回のCostItemの価格に前回落札率をかける -> ①
     * ①の直接工事費の３桁目を切り捨てる -> ②
     * 工事明細ごと(このメソッドは工事明細ごとに処理している)に① - ②の合計を計算して、「一般管理費等」か「現場管理費等・一般管理費等」に計上する
     */
    public static proratePreviewCostItemPrices(
        previewsCostItems: CostItem[],
        initialContract: Contract,
        previewsAssetStatements: AssetStatement[],
        previewsConstructionStatement: ConstructionStatement,
    ): CostItem[] {
        const previewsCostItemsAfterMultiplicationRate = previewsCostItems.map(
            ci => {
                const proratedCostItem = ci.setPriceCostItem(
                    ci.price >= 0
                        ? Math.floor(ci.price * initialContract.rate)
                        : Math.ceil(ci.price * initialContract.rate),
                );
                if (proratedCostItem.isUnitPriceEqualPrice()) {
                    proratedCostItem.unitPrice = proratedCostItem.price;
                }
                return proratedCostItem;
            },
        );
        const proratedPreviewsCostItems =
            previewsCostItemsAfterMultiplicationRate.map(ci => {
                if (!MergeCostItems.isDirectConstructionCostItem(ci)) return ci;
                const truncatedCostItemPrice =
                    ci.price >= 0
                        ? Math.floor(ci.price / 1000) * 1000
                        : Math.ceil(ci.price / 1000) * 1000;
                return ci.setPriceCostItem(truncatedCostItemPrice);
            });
        const publicManagePriceCostItem = proratedPreviewsCostItems.find(ci =>
            this.isPublicManageCostItem(ci),
        );
        assertsIsExists(
            publicManagePriceCostItem,
            '一般管理費等が存在しません',
        );
        const targetAssetStatements = previewsAssetStatements.filter(
            as =>
                as.constructionStatementId === previewsConstructionStatement.id,
        );
        const assessmentPrice = targetAssetStatements.reduce(
            (sum, assetStatement) => {
                assertsIsNotNull(assetStatement.assessmentPrice);
                return sum + assetStatement.assessmentPrice;
            },
            0,
        );
        // 按分した時の1000の桁で切り捨てた差分を現場管理費に追加する
        const proratedDifferencePrice =
            publicManagePriceCostItem.setPriceCostItem(
                publicManagePriceCostItem.price +
                    assessmentPrice -
                    proratedPreviewsCostItems.reduce(
                        (total, ci) => total + ci.price,
                        0,
                    ),
            );
        proratedDifferencePrice.unitPrice = proratedDifferencePrice.price;
        return proratedPreviewsCostItems
            .filter(
                ci =>
                    !MergeCostItems.isTargetPublicManageCostItem(
                        ci,
                        proratedDifferencePrice.constructionType,
                    ),
            )
            .concat([proratedDifferencePrice]);
    }

    public static isDirectConstructionCostItem(costItem: CostItem): boolean {
        return !notDirectConstructionPrices.includes(costItem.constructionType);
    }

    public static isPublicManageCostItem(costItem: CostItem): boolean {
        return (
            costItem.constructionType === '一般管理費等' ||
            costItem.constructionType === '現場管理費・一般管理費等'
        );
    }

    private static isTargetPublicManageCostItem(
        costItem: CostItem,
        constructionType: ConstructionType,
    ) {
        return costItem.constructionType === constructionType;
    }

    // private isSetExpense(costItem: CostItem) {
    //     return (
    //         costItem.unit === '式' &&
    //         ConstructionTypes.isExpense(costItem.constructionType)
    //     );
    // }
}
