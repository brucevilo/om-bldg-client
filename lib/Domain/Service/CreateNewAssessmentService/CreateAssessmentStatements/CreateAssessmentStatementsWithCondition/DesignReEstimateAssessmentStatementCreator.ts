import { AssessmentStatement, Contract, Contractable } from '@/Domain/Entity';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { CostDocument } from '@/Domain/ValueObject';
import { assertsIsNotNull } from '@/Infrastructure';
import { ReadAssessmentStatementsFromCostDocument } from '../ReadAssessmentStatementsFromCostDocument';
import { createLinkedBeforeContractConstructionTypeSerialNumber } from './service';

export class DesignReEstimateAssessmentStatementCreator {
    constructor(
        private contractable: Contractable,
        private costDocument: CostDocument,
        private contract: Contract,
    ) {}
    public async create(): Promise<AssessmentStatement[]> {
        const assessmentStatements =
            new ReadAssessmentStatementsFromCostDocument(
                this.costDocument,
                this.contract,
                this.contractable,
            ).invoke();
        const beforeContract = this.contractable.prevContract;
        assertsIsNotNull(beforeContract);

        const beforeAssessmentStatements =
            await AssessmentStatementRepository.findByContract(
                beforeContract.id,
            );

        return createLinkedBeforeContractConstructionTypeSerialNumber(
            assessmentStatements,
            beforeAssessmentStatements,
        );
    }
}
