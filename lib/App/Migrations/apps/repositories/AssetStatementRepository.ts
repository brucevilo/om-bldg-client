import { getClient } from '@/Infrastructure';
import {
    AssetStatementResponse,
    AssetStatementFactory,
} from '@/Domain/Factory';
import { AssetStatement } from '@/Domain/Entity';
import { chunk } from 'lodash';

export class AssetStatementRepository {
    static async mgetBySapKeys(sapKeys: string[]): Promise<AssetStatement[]> {
        const chunks = chunk(sapKeys, 100);
        const assetStatements: AssetStatement[][] = await Promise.all(
            chunks.map(async chunk => {
                const query = new URLSearchParams();
                query.append('sap_keys', chunk.join(','));
                const res = await getClient().get<AssetStatementResponse[]>(
                    `/migrations/asset_statements?${query}`,
                );
                return res.data.map(AssetStatementFactory.createFromResponse);
            }),
        );
        return assetStatements.flatMap(list => list);
    }

    static async store(
        constructionId: number,
        assetStatements: AssetStatement[],
    ): Promise<void> {
        const params = assetStatements.map(as => {
            return {
                'construction_statement_id': as.constructionStatementId,
                'asset_class_id': as.assetClass?.id,
                name: as.name,
                'distributed_price': as.distributedPrice,
                'sap_key': as.sapKey,
                'sap_recorded_at': as.sapRecordedAt,
                'sap_recorded_price': as.sapRecordedPrice,
            };
        });
        await getClient().post<unknown, AssetStatementResponse[]>(
            `/migrations/constructions/${constructionId}/asset_statements`,
            {
                'asset_statements': params,
            },
        );
    }
}
