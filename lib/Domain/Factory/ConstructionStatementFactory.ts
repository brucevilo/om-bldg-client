import { ConstructionStatement, Classification } from '@/Domain/Entity';
import {
    ConstructionStatementHistoryFactory,
    ConstructionStatementHistoryResponse,
} from './ConstructionStatementHistoryFactory';
import { CostItemResponse, CostItemFactory } from './CostItemFactory';
import {
    PreviousConstructionStatementFactory,
    PreviousConstructionStatementResponse,
} from './PreviousConstructionStatementFactory';
import { RetirementFactory, RetirementResponse } from './RetirementFactory';
import { ContractFactory, ContractResponse } from './ContractFactory';

export interface ConstructionStatementResponse {
    id: number;
    contract_id: number;
    name: string;
    project_code: string;
    term: string;
    cost_items: CostItemResponse[];
    classification: Classification;
    is_retiremented: boolean;
    is_construction_in_progress_completed: boolean;
    retirement: RetirementResponse | null;
    scheduled_acceptance_date: string | null;
    is_collateral: boolean;
    previous_construction_statement_id: number | null;
    previous_construction_statement: PreviousConstructionStatementResponse | null;
    construction_statement_histories:
        | ConstructionStatementHistoryResponse[]
        | null;
    contract: ContractResponse | null;
    created_at: string;
    updated_at: string;
}

export class ConstructionStatementFactory {
    static createFromResponse(
        res: ConstructionStatementResponse,
    ): ConstructionStatement {
        const costItems =
            res.cost_items?.map(CostItemFactory.createFromResponse) || [];
        const contract = res.contract
            ? ContractFactory.createFromResponse(res.contract)
            : null;
        const csHistory =
            res.construction_statement_histories?.map(
                ConstructionStatementHistoryFactory.createFromResponse,
            ) || [];
        const retirement =
            res.retirement &&
            RetirementFactory.createFromResponseObject(res.retirement);

        return new ConstructionStatement(
            res.id,
            res.contract_id,
            res.name,
            res.project_code ? res.project_code : '',
            new Date(res.term),
            costItems,
            res.classification,
            res.is_retiremented,
            res.is_construction_in_progress_completed,
            retirement,
            res.scheduled_acceptance_date
                ? new Date(res.scheduled_acceptance_date)
                : null,
            res.is_collateral,
            res.previous_construction_statement_id,
            res.previous_construction_statement
                ? PreviousConstructionStatementFactory.createFromResponse(
                      res.previous_construction_statement,
                  )
                : null,
            contract,
            csHistory,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
