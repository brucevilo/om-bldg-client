import { AssessmentStatement, Contract, Contractable } from '@/Domain/Entity';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { ReContractBuildAssessmentStatementsService } from '../Logics/RecontractAddedAssessmentPriceStatements/ReContractBuildAssessmentStatementsService';
import { linkBeforeAssessmentStatementId } from './service';

export class DesignReContractAssessmentStatementsCreator {
    constructor(
        private contract: Contract,
        private contractable: Contractable,
    ) {}

    public async create(): Promise<AssessmentStatement[]> {
        const estimateAssessmentStatements =
            await AssessmentStatementRepository.findByContract(
                this.contract.id,
            );
        const beforeContract = this.contractable.prevContract;
        if (!beforeContract) {
            throw new Error('設計変更後の設計以外では呼び出さないクラスです');
        }
        const beforeContractAssessmentStatements =
            await AssessmentStatementRepository.findByContract(
                beforeContract.id,
            );
        const assessmentStatements =
            new ReContractBuildAssessmentStatementsService(
                this.contract,
                beforeContract,
                estimateAssessmentStatements,
                beforeContractAssessmentStatements,
            ).invoke();

        return linkBeforeAssessmentStatementId(
            assessmentStatements,
            estimateAssessmentStatements,
        );
    }
}
