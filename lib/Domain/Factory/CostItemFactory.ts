import {
    CostItem,
    AssetClass,
    CostItemTag,
    AssetChecklist,
} from '@/Domain/Entity';
import {
    AssetClassResponse,
    AssetClassFactory,
    CostItemTagFactory,
    CostItemTagResponse,
    AssetChecklistFactory,
    AssetChecklistResponse,
} from '.';
import { AttachmentInfo, ConstructionType } from '@/Domain/ValueObject';

export interface CostItemResponse {
    id: number;
    construction_statement_id: number;
    name: string;
    construction_type: ConstructionType;
    code: number;
    dimension: string;
    amount: number;
    unit: string;
    unit_price: number;
    price: number;
    construction_time: string;
    transportation_time: string;
    remarks: string;
    asset_class: AssetClassResponse | null;
    cost_item_tags: CostItemTagResponse[];
    asset_checklists: AssetChecklistResponse[];
    memo: string;
    photos_info: AttachmentInfo[];
    merged_cost_item_id: number | null;
    estimate_price: number | null;
    estimate_amount: number | null;
    asset_class_info: string | null;
    created_at: string;
    updated_at: string;
}

export class CostItemFactory {
    static createFromResponse(res: CostItemResponse): CostItem {
        const tags: CostItemTag[] = res.cost_item_tags
            ? res.cost_item_tags.map(CostItemTagFactory.createFromResponse)
            : [];
        const assetClass: AssetClass | null = res.asset_class
            ? AssetClassFactory.createFromResponse(res.asset_class)
            : null;
        const assetChecklists: AssetChecklist[] = res.asset_checklists
            ? res.asset_checklists.map(AssetChecklistFactory.createFromResponse)
            : [];
        return new CostItem(
            res.id,
            res.construction_statement_id,
            res.name,
            res.construction_type,
            res.code,
            res.dimension,
            res.amount,
            res.unit,
            res.unit_price,
            res.price,
            res.construction_time,
            res.transportation_time,
            res.remarks,
            assetClass,
            tags,
            assetChecklists,
            res.memo,
            res.photos_info,
            res.merged_cost_item_id,
            res.estimate_price,
            res.estimate_amount,
            res.asset_class_info,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
