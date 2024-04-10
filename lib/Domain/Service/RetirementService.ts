import { RetirementCreateRequest } from '@/Domain/Repository';
import { CostItem, AssetStatement, RetirementCostItem } from '@/Domain/Entity';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';

export interface StoredRetirementParams {
    costItemId: number;
    assetStatementId: number;
    amount: number;
}

export interface RetirementCreateParams {
    costItem: CostItem;
    assetStatement: AssetStatement;
    amount: number;
}

export class RetirementService {
    static buildRetirementCreateRequest(
        constructionStatementId: number | null,
        retirementedAt?: string,
        params?: RetirementCreateParams[],
        contractRate?: number,
    ): RetirementCreateRequest {
        if (!retirementedAt || !params || !contractRate) {
            assertsIsNotNull(constructionStatementId, '工事明細IDがありません');
            return {
                construction_statement_id: constructionStatementId,
            };
        }
        const constructionStatementIdParams = constructionStatementId
            ? { construction_statement_id: constructionStatementId }
            : {};

        return {
            data: params.map(p => ({
                cost_item_id: p.costItem.id as number,
                asset_statement_id: p.assetStatement.id as number,
                amount: p.assetStatement.isPrivatized
                    ? p.amount
                    : p.costItem.amount,
                price: p.assetStatement.isPrivatized
                    ? Math.floor(p.costItem.unitPrice * p.amount * contractRate)
                    : p.costItem.price,
            })),
            retiremented_at: retirementedAt,
            ...constructionStatementIdParams,
        };
    }

    public static calcRemainSapRecordedPrice(
        assetStatement: AssetStatement,
        retirementCostItems: RetirementCostItem[],
    ): number {
        assertsIsExists(
            assetStatement.sapRecordedPrice,
            'sapRecordedPriceが紐づいていない資産からは除却できません',
        );
        return retirementCostItems
            .filter(rc => rc.assetStatement.id === assetStatement.id)
            .reduce(
                (sum, rci) => sum - rci.price,
                assetStatement.sapRecordedPrice,
            );
    }

    public static calcRetirementedSapRecordedPrice(
        retirementCreateParamsArray: RetirementCreateParams[],
        retirementCostItems: RetirementCostItem[],
        contractRate: number,
    ): number {
        const retirementedRemainSapRecordedPrice =
            this.calcRemainSapRecordedPrice(
                retirementCreateParamsArray[0].assetStatement,
                retirementCostItems,
            );

        const sumCurrentRetirementPrice = retirementCreateParamsArray.reduce(
            (sum, params) => {
                if (!params.assetStatement.isPrivatized)
                    return sum + params.costItem.price;
                return (
                    Math.floor(
                        params.amount *
                            params.costItem.unitPrice *
                            contractRate,
                    ) + sum
                );
            },
            0,
        );

        return retirementedRemainSapRecordedPrice - sumCurrentRetirementPrice;
    }

    public static calcRetirementedRemainCostItemAmount(
        costItem: CostItem,
        retirementedCostItems: RetirementCostItem[],
    ): number {
        return retirementedCostItems
            .filter(ri => ri.costItem.id === costItem.id)
            .reduce((sum, rci) => sum - rci.amount, costItem.amount);
    }

    public static calcRetirementedRemainCostItemPrice(
        costItem: CostItem,
        retirementedCostItems: RetirementCostItem[],
    ): number {
        return retirementedCostItems
            .filter(ri => ri.costItem.id === costItem.id)
            .reduce((sum, rci) => sum - rci.price, costItem.price);
    }
}
