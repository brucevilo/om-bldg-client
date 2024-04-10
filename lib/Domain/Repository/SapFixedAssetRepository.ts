import { assertsIsExists, getClient } from '@/Infrastructure';
import {
    SapFixedAssetResponse,
    SapFixedAssetFactory,
    ActionHistoryFactory,
    ActionHistoryResponse,
} from '../Factory';
import {
    AssetStatement,
    CostItemTag,
    SapFixedAsset,
    ActionHistory,
} from '../Entity';
import { MappedFetchPagenateData } from '@/App/Service';

interface SapFixedAssetRequest {
    user_id: number;
}

export class SapFixedAssetRepository {
    static async list(
        page: number,
    ): Promise<MappedFetchPagenateData<SapFixedAsset>> {
        const searchParams = new URLSearchParams();
        searchParams.append('page', page.toString());
        const res = await getClient().get<SapFixedAssetResponse[]>(
            `/sap_fixed_assets?${searchParams}`,
        );
        return {
            values: res.data.map(SapFixedAssetFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async getActionHistories(id: number): Promise<ActionHistory[]> {
        const res = await getClient().get<ActionHistoryResponse[]>(
            `/sap_fixed_assets/${id}/action_histories`,
        );
        return res.data.map(ActionHistoryFactory.createFromResponse);
    }

    static async mgetByAssetStatements(
        assetStatements: AssetStatement[],
        page: number,
    ): Promise<MappedFetchPagenateData<SapFixedAsset>> {
        const sapFixedAssetIds = assetStatements
            .map(as => {
                assertsIsExists(as.sapFixedAssetId);
                return as.sapFixedAssetId;
            })
            .join(',');
        const res = await getClient().post<
            { sap_fixed_asset_ids: string; page: number },
            SapFixedAssetResponse[]
        >(`/sap_fixed_assets`, {
            sap_fixed_asset_ids: sapFixedAssetIds,
            page,
        });
        return {
            values: res.data.map(SapFixedAssetFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async search(
        page: number,
        displayUncheckedAsset: boolean,
        startAt: string,
        endAt: string,
        costItemTags: CostItemTag[],
    ): Promise<MappedFetchPagenateData<SapFixedAsset>> {
        const searchParams = new URLSearchParams();
        searchParams.append('page', page.toString());
        searchParams.append(
            'display_unchecked_asset',
            displayUncheckedAsset.toString(),
        );
        searchParams.append('start_at', startAt);
        searchParams.append('end_at', endAt);
        searchParams.append(
            'cost_item_tag_names',
            costItemTags.map(t => t.name).join(','),
        );
        const res = await getClient().get<SapFixedAssetResponse[]>(
            `/sap_fixed_assets?${searchParams}`,
        );
        return {
            values: res.data.map(SapFixedAssetFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async get(id: number): Promise<SapFixedAsset> {
        const res = await getClient().get<SapFixedAssetResponse>(
            `/sap_fixed_assets/${id}`,
        );
        return SapFixedAssetFactory.createFromResponse(res.data);
    }

    static async create(csv: File): Promise<SapFixedAsset[]> {
        const params = {
            sap_csv: csv,
        };
        const res = await getClient().formPost<
            { sap_csv: File },
            SapFixedAssetResponse[]
        >('/sap_fixed_assets', params);
        return res.data.map(SapFixedAssetFactory.createFromResponse);
    }

    static async update(
        id: number,
        { userId }: SapFixedAsset,
    ): Promise<SapFixedAsset> {
        if (!userId) assertsIsExists(userId);
        const params: SapFixedAssetRequest = {
            user_id: userId,
        };
        const res = await getClient().patch<
            SapFixedAssetRequest,
            SapFixedAssetResponse
        >(`/sap_fixed_assets/${id}`, params);
        return SapFixedAssetFactory.createFromResponse(res.data);
    }

    static async downloadCsv(): Promise<void> {
        const res = await getClient().get<string>('/sap_fixed_assets/csv');
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const url = URL.createObjectURL(new Blob([bom, res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sap_fixed_assets.csv');
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
    }
}
