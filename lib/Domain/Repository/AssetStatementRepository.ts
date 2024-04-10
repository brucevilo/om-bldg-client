import { getClient } from '@/Infrastructure';
import {
    AssetStatementResponse,
    AssetStatementFactory,
} from '@/Domain/Factory';
import { AssetStatement, SapFixedAsset } from '@/Domain/Entity';
import { ConstructionStatementForStore } from './ConstructionStatementRepository';

export interface SapRecordParamsForAssetStatementUpdate {
    assetStatementId: number;
    sapWbsCode: string;
    sapBusinessCode: string;
    sapRecordedAt: Date;
}

export type AssetStatementForStore = Pick<
    AssetStatement,
    | 'assetClass'
    | 'name'
    | 'distributedPrice'
    | 'constructionTypeSerialNumber'
    | 'buildingsId'
> & {
    constructionStatement: ConstructionStatementForStore;
};

export class AssetStatementRepository {
    static async get(id: number): Promise<AssetStatement> {
        const res = await getClient().get<AssetStatementResponse>(
            `/asset_statements/${id}`,
        );
        return AssetStatementFactory.createFromResponse(res.data);
    }

    static async list(): Promise<AssetStatement[]> {
        const res = await getClient().get<AssetStatementResponse[]>(
            '/asset_statements',
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async search(params: {
        sapKey?: string;
        startAt?: string;
        endAt?: string;
        name?: string;
        isLatestContract?: boolean;
    }): Promise<AssetStatement[]> {
        const { sapKey, startAt, endAt, name, isLatestContract } = params;
        const searchQuery = new URLSearchParams();
        if (sapKey) {
            searchQuery.append('sap_key', sapKey || '');
        }
        if (startAt) {
            searchQuery.append('start_at', startAt || '');
        }
        if (endAt) {
            searchQuery.append('end_at', endAt || '');
        }
        if (name) {
            searchQuery.append('name', name || '');
        }
        if (isLatestContract) {
            searchQuery.append('is_latest_contract', 'true');
        }
        const res = await getClient().get<AssetStatementResponse[]>(
            `/asset_statements/search?${searchQuery}`,
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async listByConstruction(
        constructionId: number,
        contractId: number,
    ): Promise<AssetStatement[]> {
        const res = await getClient().get<AssetStatementResponse[]>(
            `/constructions/${constructionId}/asset_statements?contract_id=${contractId}`,
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async mgetBySapFixedAsset(id: number): Promise<AssetStatement[]> {
        const res = await getClient().get<AssetStatementResponse[]>(
            `/sap_fixed_assets/${id}/asset_statements`,
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async mgetBySapFixedAssets(
        sapFixedAssets: SapFixedAsset[],
    ): Promise<AssetStatement[]> {
        const searchQuery = new URLSearchParams();
        searchQuery.append(
            'sap_fixed_asset_ids',
            sapFixedAssets.map(sfa => sfa.id).join(','),
        );
        const res = await getClient().get<AssetStatementResponse[]>(
            `/asset_statements?${searchQuery}`,
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async mgetByConstructionStatements(
        constructionStatementIds: number[],
    ): Promise<AssetStatement[]> {
        const res = await getClient().get<AssetStatementResponse[]>(
            `/asset_statements?construction_statement_ids=${constructionStatementIds}`,
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async mgetByCostItemIds(
        costItemIds: number[],
    ): Promise<AssetStatement[]> {
        const searchQuery = new URLSearchParams();
        searchQuery.append(
            'cost_item_ids',
            costItemIds.map(id => id).join(','),
        );
        const res = await getClient().get<AssetStatementResponse[]>(
            `/asset_statements?${searchQuery}`,
        );
        return res.data.map(AssetStatementFactory.createFromResponse);
    }

    static async store(
        constructionId: number,
        assetStatements: AssetStatement[],
    ): Promise<void> {
        const params = assetStatements.map(as => {
            return {
                construction_statement_id: as.constructionStatementId,
                asset_class_id: as.assetClass?.id,
                name: as.name,
                distributed_price: as.distributedPrice,
                construction_type_serial_number:
                    as.constructionTypeSerialNumber,
                buildings_id: as.buildingsId,
            };
        });
        await getClient().post<unknown, AssetStatementResponse[]>(
            `/constructions/${constructionId}/asset_statements`,
            {
                asset_statements: params,
            },
        );
    }

    static updateBySapRecords = async (
        sapRecordParamsForAssetStatementUpdateArray: SapRecordParamsForAssetStatementUpdate[],
    ): Promise<void> => {
        await getClient().patch<unknown, AssetStatementResponse[]>(
            `/asset_statements/sap_record`,
            {
                sap_record_params_array:
                    sapRecordParamsForAssetStatementUpdateArray.map(params => ({
                        id: params.assetStatementId,
                        sap_wbs_code: params.sapWbsCode,
                        sap_business_code: params.sapBusinessCode,
                        sap_recorded_at: params.sapRecordedAt,
                    })),
            },
        );
    };

    static async updateByAssessment(
        assetStatements: AssetStatement[],
    ): Promise<void> {
        await getClient().patch<unknown, AssetStatementResponse[]>(
            '/asset_statements/assessment',
            {
                asset_statements: assetStatements.map(statement => ({
                    id: statement.id,
                    'assessment_price': statement.assessmentPrice,
                })),
            },
        );
    }
}
