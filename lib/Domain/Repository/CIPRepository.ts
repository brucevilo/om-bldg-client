import { getClient } from '@/Infrastructure';
import { AssetStatement, CIP } from '../Entity';
import { CIPFactory, CIPResponse } from '../Factory';

export class CIPRepository {
    static async findByContract(contractId: number): Promise<CIP[]> {
        const res = await getClient().get<CIPResponse[]>(
            `/contracts/${contractId}/cips`,
        );
        return res.data.map(CIPFactory.createFromResponse);
    }

    static async create(params: {
        contractId: number;
        handoverDocument: File;
        manageSheet: File;
        memo: string;
    }): Promise<void> {
        await getClient().formPost<
            {
                contract_id: number;
                handover_document: File;
                manage_sheet: File;
                memo: string;
            },
            void
        >(`/cips`, {
            contract_id: params.contractId,
            handover_document: params.handoverDocument,
            manage_sheet: params.manageSheet,
            memo: params.memo,
        });
        return;
    }

    static async update(assetStatements: AssetStatement[]): Promise<void> {
        const params = assetStatements.map(as => ({
            id: as.id,
            construction_statement_id: as.constructionStatementId,
            distributed_design_cost: as.distributedDesignCost,
        }));
        await getClient().patch('/cips', { asset_statements: params });
        return;
    }

    public static async reset(constructionId: number): Promise<void> {
        await getClient().delete(`/constructions/${constructionId}/cips`);
    }
}
