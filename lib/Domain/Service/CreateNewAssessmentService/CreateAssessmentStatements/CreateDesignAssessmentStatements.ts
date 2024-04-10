import { AssessmentStatement, Contract, Contractable } from '@/Domain/Entity';
import { CostDocument } from '@/Domain/ValueObject';
import { DesignContractAssessmentStatementCreator } from './CreateAssessmentStatementsWithCondition/DesignContractAssessmentStatementCreator';
import { DesignEstimateAssessmentStatementCreator } from './CreateAssessmentStatementsWithCondition/DesignEstimateAssessmentStatementCreator';
import { DesignReContractAssessmentStatementsCreator } from './CreateAssessmentStatementsWithCondition/DesignReContractAssessmentStatementsCreator';
import { DesignReEstimateAssessmentStatementCreator } from './CreateAssessmentStatementsWithCondition/DesignReEstimateAssessmentStatementCreator';

export class CreateDesignAssessmentStatements {
    constructor(
        private contractable: Contractable,
        private contract: Contract,
        private costDocument: CostDocument,
    ) {}

    public async invoke(): Promise<AssessmentStatement[]> {
        if (this.contractable.contracts.length > 1) {
            if (this.contract.contractedPrice) {
                return await new DesignReContractAssessmentStatementsCreator(
                    this.contract,
                    this.contractable,
                ).create();
            } else {
                return await new DesignReEstimateAssessmentStatementCreator(
                    this.contractable,
                    this.costDocument,
                    this.contract,
                ).create();
            }
        } else {
            if (this.contract.contractedPrice) {
                return await new DesignContractAssessmentStatementCreator(
                    this.contract,
                    this.costDocument,
                    this.contractable,
                ).create();
            } else {
                return await new DesignEstimateAssessmentStatementCreator(
                    this.costDocument,
                    this.contract,
                    this.contractable,
                ).create();
            }
        }
    }
}
