import { EditMigratedDesignAndContractParams } from '@/App/Service/EditMigratedDesign';
import { EditMigratedDesignContractParams } from '@/App/Service/EditMigratedDesignContract';
import { Design, MigrationStatus } from '@/Domain/Entity';
import { DesignFactory, DesignResponse } from '@/Domain/Factory';
import { getClient } from '@/Infrastructure';

export class MigratedDesignRepository {
    static async createFromSapFixedAssets(): Promise<Design[]> {
        const res = await getClient().post<unknown, DesignResponse[]>(
            `/migrations/designs`,
            {},
        );
        return res.data.map(res => DesignFactory.createFromResponse(res));
    }

    static async updateMigratedDesignContract(
        designId: number,
        params: EditMigratedDesignContractParams[],
    ): Promise<Design> {
        const res = await getClient().patch<
            EditMigratedDesignContractParams[],
            DesignResponse
        >(`/migrations/designs/${designId}/contract_files`, params);
        return DesignFactory.createFromResponse(res.data);
    }

    static async updateMigratedDesign(
        designId: number,
        status: MigrationStatus,
    ): Promise<Design> {
        const res = await getClient().patch<
            { migration_status: MigrationStatus },
            DesignResponse
        >(`/migrations/designs/${designId}`, { migration_status: status });
        return DesignFactory.createFromResponse(res.data);
    }

    static async updateMigratedDesignAndContract(
        designId: number,
        params: EditMigratedDesignAndContractParams,
    ): Promise<Design> {
        const res = await getClient().patch<
            EditMigratedDesignAndContractParams,
            DesignResponse
        >(`/migrations/designs/${designId}/contract`, params);
        return DesignFactory.createFromResponse(res.data);
    }
}
