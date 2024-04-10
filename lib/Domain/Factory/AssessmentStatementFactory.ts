import { AssessmentStatement } from '../Entity';

export interface AssessmentStatementResponse {
    id: number;
    part: string;
    name: string;
    size: string;
    amount: number;
    unit: string;
    cost_document_price: number;
    price: number | null;
    is_open: boolean;
    construction_type_serial_number: number | null;
}

export class AssessmentStatementFactory {
    static createFromResponse(
        res: AssessmentStatementResponse,
    ): AssessmentStatement {
        return new AssessmentStatement(
            res.id,
            res.part,
            res.name,
            res.size,
            res.amount,
            res.unit,
            res.cost_document_price,
            res.price,
            res.is_open,
            res.construction_type_serial_number || undefined,
        );
    }
}
