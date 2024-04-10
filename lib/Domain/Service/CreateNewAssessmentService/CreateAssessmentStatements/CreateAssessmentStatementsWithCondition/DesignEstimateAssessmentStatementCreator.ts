import { AssessmentStatement, Contract, Contractable } from '@/Domain/Entity';
import { CostDocument } from '@/Domain/ValueObject';
import { ReadAssessmentStatementsFromCostDocument } from '../ReadAssessmentStatementsFromCostDocument';

export class DesignEstimateAssessmentStatementCreator {
    constructor(
        private costDocument: CostDocument,
        private contract: Contract,
        private contractable: Contractable,
    ) {}
    public async create(): Promise<AssessmentStatement[]> {
        const assessmentStatements =
            new ReadAssessmentStatementsFromCostDocument(
                this.costDocument,
                this.contract,
                this.contractable,
            ).invoke();

        return assessmentStatements;
    }
}
