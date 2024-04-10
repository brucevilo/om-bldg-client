import { AssetChecklist, SapFixedAsset } from '../Entity';
import {
    AssetChecklistFactory,
    AssetChecklistResponse,
} from './AssetChecklistFactory';

export interface SapFixedAssetResponse {
    id: number;
    user_id: number;
    key: string;
    asset_name: string;
    asset_text: string;
    recorded_at: string;
    business_code: string;
    wbs_code: string;
    asset_class_code: string;
    term_end_price: number;
    asset_checklists: AssetChecklistResponse[];
    created_at: string;
    updated_at: string;
}

export class SapFixedAssetFactory {
    static createFromResponse(res: SapFixedAssetResponse): SapFixedAsset {
        const assetChecklists: AssetChecklist[] = res.asset_checklists
            ? res.asset_checklists.map(AssetChecklistFactory.createFromResponse)
            : [];
        return new SapFixedAsset(
            res.id,
            res.user_id,
            res.key,
            res.asset_name,
            res.asset_text,
            new Date(res.recorded_at),
            res.business_code,
            res.wbs_code,
            res.asset_class_code,
            res.term_end_price,
            assetChecklists,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
