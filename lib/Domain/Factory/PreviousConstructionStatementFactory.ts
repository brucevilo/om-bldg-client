import { PreviousConstructionStatement, Classification } from '@/Domain/Entity';

export interface PreviousConstructionStatementResponse {
    id: number;
    contract_id: number;
    name: string;
    project_code: string;
    term: string;
    classification: Classification;
    is_retiremented: boolean;
    is_construction_in_progress_completed: boolean;
    scheduled_acceptance_date: string | null;
    is_collateral: boolean;
    created_at: string;
    updated_at: string;
}

export class PreviousConstructionStatementFactory {
    static createFromResponse(
        res: PreviousConstructionStatementResponse,
    ): PreviousConstructionStatement {
        return new PreviousConstructionStatement(
            res.id,
            res.contract_id,
            res.name,
            res.project_code ? res.project_code : '',
            new Date(res.term),
            res.classification,
            res.is_retiremented,
            res.is_construction_in_progress_completed,
            res.scheduled_acceptance_date
                ? new Date(res.scheduled_acceptance_date)
                : null,
            res.is_collateral,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
