import { getClient } from '@/Infrastructure';
import { CostItem, RetirementCostItem } from '../Entity';
import {
    RetirementCostItemResponse,
    RetirementCostItemFactory,
} from '../Factory';

export class RetirementCostItemRepository {
    public static async mgetByCostItems(
        costItems: CostItem[],
    ): Promise<RetirementCostItem[]> {
        const res = await getClient().post<
            { cost_item_ids: string },
            RetirementCostItemResponse[]
        >('/retirement_cost_items', {
            cost_item_ids: costItems.map(item => item.id).join(','),
        });
        return res.data.map(RetirementCostItemFactory.createFromResponseObject);
    }

    public static async mgetByCostItem(
        costItem: CostItem,
    ): Promise<RetirementCostItem[]> {
        const res = await getClient().get<RetirementCostItemResponse[]>(
            `/retirement_cost_items?cost_item_id=${costItem.id}`,
        );
        return res.data.map(RetirementCostItemFactory.createFromResponseObject);
    }
}
