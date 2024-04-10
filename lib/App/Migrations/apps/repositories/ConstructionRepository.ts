import { EditMigratedConstructionAndContractParams } from '@/App/Service/EditMigratedConstruction';
import { EditMigratedConstructionContractFileParams } from '@/App/Service/EditMigratedConstructionContractFile';
import { Construction, MigrationStatus } from '@/Domain/Entity';
import { ConstructionFactory, ConstructionResponse } from '@/Domain/Factory';
import { getClient } from '@/Infrastructure';

export class MigratedConstructionRepository {
    static async createFromSapFixedAssets(): Promise<Construction[]> {
        const res = await getClient().post<unknown, ConstructionResponse[]>(
            `/migrations/constructions`,
            {},
        );
        return res.data.map(res => ConstructionFactory.createFromResponse(res));
    }

    static async updateMigratedConstructionContract(
        constructionId: number,
        params: EditMigratedConstructionContractFileParams[],
    ): Promise<Construction> {
        const res = await getClient().patch<
            EditMigratedConstructionContractFileParams[],
            ConstructionResponse
        >(`/migrations/constructions/${constructionId}/contract_files`, params);
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async updateMigratedConstruction(
        constructionId: number,
        status: MigrationStatus,
    ): Promise<Construction> {
        const res = await getClient().patch<unknown, ConstructionResponse>(
            `/migrations/constructions/${constructionId}`,
            { migration_status: status },
        );
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async updateMigratedConstructionAndContract(
        constructionId: number,
        params: EditMigratedConstructionAndContractParams,
    ): Promise<Construction> {
        const res = await getClient().patch<
            EditMigratedConstructionAndContractParams,
            ConstructionResponse
        >(`/migrations/constructions/${constructionId}/contract`, params);
        return ConstructionFactory.createFromResponse(res.data);
    }
}
