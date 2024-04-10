import { CostItemRepository } from '../Repository';
import { CostItem, Contract } from '@/Domain/Entity';
import { RetirementCostItem, CostItemRetirementStatus } from '@/Domain/Entity';
import { sum } from 'lodash';
import { ContractRate } from '@/Domain/ValueObject';

type SearchParams = {
    tagNames?: string[];
    costItemNames?: string[];
    constructionId?: number;
    isAsset?: boolean;
    assetClassName?: string;
    constructionStatementId?: number;
    filterRetiremented?: boolean;
    page?: number;
    sapRecordedAtStartAt?: string;
    sapRecordedAtEndAt?: string;
    constructionName?: string;
    isLatestContract?: boolean;
};

export interface CreateCostItemParams {
    name: string;
    unitPrice: number;
    amount: number;
    price: number;
    assetClassId: number;
    code: string;
    constructionStatementId: number;
}

export class CostItemService {
    public static buildSearchParams(params: SearchParams): URLSearchParams {
        const urlSearchParams = new URLSearchParams();
        // 以下の場合はcost_itemを費用とみなす
        // cost_itemにasset_classが結びついていない
        // assetClassのaccount_divisionが費用の時
        if (params.isAsset) {
            urlSearchParams.append('asset_class_id_not_null', '1');
            urlSearchParams.append(
                'asset_class_account_division_not_eq',
                '費用',
            );
        }
        if (params.constructionId) {
            urlSearchParams.append(
                'construction_statement_construction_id_eq',
                params.constructionId.toString(),
            );
        }
        if (params.costItemNames) {
            params.costItemNames.forEach(cin =>
                urlSearchParams.append('name_cont_all[]', cin),
            );
        }
        if (params.tagNames) {
            params.tagNames.forEach(tn =>
                urlSearchParams.append('cost_item_tags_name_cont_all[]', tn),
            );
        }
        if (params.page) {
            urlSearchParams.append('page', params.page.toString());
        }
        if (params.assetClassName) {
            urlSearchParams.append(
                'asset_class_name_eq',
                params.assetClassName,
            );
        }
        if (params.constructionStatementId) {
            urlSearchParams.append(
                'construction_statement_id_eq',
                params.constructionStatementId.toString(),
            );
        }
        if (params.filterRetiremented) {
            urlSearchParams.append('filter_retiremented', 'true');
        }
        if (params.sapRecordedAtStartAt) {
            urlSearchParams.append(
                'sap_recorded_at_start_at',
                params.sapRecordedAtStartAt,
            );
        }
        if (params.sapRecordedAtEndAt) {
            urlSearchParams.append(
                'sap_recorded_at_end_at',
                params.sapRecordedAtEndAt,
            );
        }
        if (params.constructionName) {
            urlSearchParams.append(
                'construction_name',
                params.constructionName,
            );
        }
        if (params.isLatestContract) {
            urlSearchParams.append('is_latest_contract', 'true');
        }

        return urlSearchParams;
    }

    static async mStore(
        createCostItemParams: CreateCostItemParams[],
    ): Promise<CostItem[]> {
        const requests = createCostItemParams.map(params => {
            return CostItemRepository.store({
                name: params.name,
                unit_price: params.unitPrice,
                amount: params.amount,
                price: params.price,
                construction_type: '',
                construction_time: '',
                transportation_time: '',
                asset_class_id: params.assetClassId,
                construction_statement_id: params.constructionStatementId,
                unit: '',
            });
        });
        const costItems = await Promise.all(requests);
        return costItems;
    }

    public static calcNotRetirementAmount(
        costItem: CostItem,
        retirementCostItems: RetirementCostItem[],
    ): number {
        const remainAmount =
            costItem.amount -
            sum(
                retirementCostItems
                    .filter(rci => rci.costItem.id === costItem.id)
                    .map(rci => rci.amount),
            );
        return remainAmount;
    }

    public static calcRetirementStatus(
        costItem: CostItem,
        retirementCostItems: RetirementCostItem[],
    ): CostItemRetirementStatus {
        const remainAmount = this.calcNotRetirementAmount(
            costItem,
            retirementCostItems,
        );
        if (remainAmount == costItem.amount) {
            return CostItemRetirementStatus.NotYet;
        } else if (remainAmount > 0) {
            return CostItemRetirementStatus.PartOf;
        } else {
            return CostItemRetirementStatus.Done;
        }
    }

    public static calcContractAtCostItemPrice(
        costItem: CostItem,
        contract: Contract,
    ): number {
        if (contract.isPrivatized) {
            const contractRate = new ContractRate(
                Number(contract.expectedPriceWithTax),
                Number(contract.contractedPrice),
            ).value;
            return Math.ceil(costItem.price * contractRate);
        } else return costItem.price;
    }
}
