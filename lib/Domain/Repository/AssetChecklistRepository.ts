import { assertsIsExists, getClient } from '@/Infrastructure';
import { AssetChecklist, CostItem, SapFixedAsset } from '../Entity';
import { AssetChecklistFactory, AssetChecklistResponse } from '../Factory';

export interface EditAssetChecklistRequest {
    cost_item_ids: number[];
    sap_fixed_asset_ids: number[];
}

export class AssetChecklistRepository {
    static async create(
        costItems: CostItem[],
        sapFixedAssets: SapFixedAsset[],
    ): Promise<AssetChecklist[]> {
        const params: EditAssetChecklistRequest = {
            cost_item_ids: costItems.map(item => {
                assertsIsExists(item.id);
                return item.id;
            }),
            sap_fixed_asset_ids: sapFixedAssets.map(sapFixedAsset => {
                assertsIsExists(sapFixedAsset.id);
                return sapFixedAsset.id;
            }),
        };
        const res = await getClient().post<
            EditAssetChecklistRequest,
            AssetChecklistResponse[]
        >('/asset_checklists', params);
        return res.data.map(AssetChecklistFactory.createFromResponse);
    }
}
