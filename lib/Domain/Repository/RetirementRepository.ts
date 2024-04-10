import { getClient } from '@/Infrastructure';
import { RetirementFactory, RetirementResponse } from '../Factory';
import { Retirement } from '@/Domain/Entity';

export interface RetirementCreateRequest {
    data?: {
        cost_item_id: number;
        asset_statement_id: number;
        amount: number;
        price: number;
    }[];
    construction_statement_id?: number;
    retiremented_at?: string;
}

export class RetirementRepository {
    public static async create(
        retirementCreateRequest: RetirementCreateRequest,
        constructionId: number,
    ): Promise<void> {
        await getClient().post<RetirementCreateRequest, void>(
            `/constructions/${constructionId}/retirements`,
            retirementCreateRequest,
        );
    }

    public static async get(retirementId: number): Promise<Retirement> {
        const res = await getClient().get<RetirementResponse>(
            `/retirements/${retirementId}`,
        );
        return RetirementFactory.createFromResponseObject(res.data);
    }

    public static async resetByConstructionStatement(
        constructionStatementId: number,
    ): Promise<void> {
        await getClient().delete(
            `/construction_statements/${constructionStatementId}/retirements`,
        );
    }
}
