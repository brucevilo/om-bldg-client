import { AssessmentStatement, Contract, Contractable } from '@/Domain/Entity';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { CostDocument } from '@/Domain/ValueObject';
import { assertsIsExists } from '@/Infrastructure';
import { BuildAdjustAssessmentStatementsService } from '../Logics/BuildAdjustAssessmentStatementsService';
import { ReadAssessmentStatementsFromCostDocument } from '../ReadAssessmentStatementsFromCostDocument';
import { linkBeforeAssessmentStatementId } from './service';

export class DesignContractAssessmentStatementCreator {
    constructor(
        private contract: Contract,
        private costDocument: CostDocument,
        private contractable: Contractable,
    ) {}
    public async create(): Promise<AssessmentStatement[]> {
        const assessmentStatementWithoutPrices =
            new ReadAssessmentStatementsFromCostDocument(
                this.costDocument,
                this.contract,
                this.contractable,
            ).invoke();
        const adjustAssessmentStatements =
            new BuildAdjustAssessmentStatementsService(this.contract, {
                contractableTypeIsConstruction: false,
                statements: assessmentStatementWithoutPrices,
            }).invoke();
        const assessmentStatementsWithPrice =
            assessmentStatementWithoutPrices.map(as => {
                const targetAdjustAssessmentStatements =
                    adjustAssessmentStatements.find(
                        ads => ads.name === as.name && ads.part === as.part,
                    );
                assertsIsExists(
                    targetAdjustAssessmentStatements,
                    '対象の設計明細金額がありません',
                );
                return {
                    ...as,
                    price: targetAdjustAssessmentStatements.correctedPrice || 0,
                };
            });
        const beforeAssessmentStatements =
            await AssessmentStatementRepository.findByContract(
                this.contract.id,
            );
        const result = linkBeforeAssessmentStatementId(
            assessmentStatementsWithPrice,
            beforeAssessmentStatements,
        );
        return result;
    }
}
