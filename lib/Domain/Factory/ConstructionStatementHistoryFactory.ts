import { ConstructionStatementHistory } from '@/Domain/Entity';
import { AttachmentInfo } from '../ValueObject';

export interface ConstructionStatementHistoryResponse {
    id: number;
    asset_difference: number;
    construction_statement_id: number;
    removal_fee_difference: number;
    repair_fee_difference: number;
    partial_payment: number;
    partial_payment_acceptance_date: string;
    is_draft: boolean;
    reason_for_change: string;
    construction_period: string;
    scheduled_acceptance_date: string;
    file_info: AttachmentInfo | null;
    created_at: string;
    updated_at: string;
}

export class ConstructionStatementHistoryFactory {
    static createFromResponse(
        res: ConstructionStatementHistoryResponse,
    ): ConstructionStatementHistory {
        return new ConstructionStatementHistory(
            res.id,
            res.construction_statement_id,
            res.asset_difference,
            res.repair_fee_difference,
            res.removal_fee_difference,
            new Date(res.construction_period),
            new Date(res.scheduled_acceptance_date),
            res.partial_payment,
            new Date(res.partial_payment_acceptance_date),
            res.is_draft,
            res.reason_for_change,
            res.file_info,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
