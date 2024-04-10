import { Assessment, CostDocument } from '../../ValueObject';
import { Contract, AssessmentStatement, Contractable } from '../../Entity';
import { CreateDesignAssessmentStatements } from './CreateAssessmentStatements/CreateDesignAssessmentStatements';
import { fetchCostDocument } from '@/App/Service/fetchFiles';
import { CreateAddAssessmentPriceAssetStatementsCreator } from '@/Domain/Service/CreateNewAssessmentService/CreateAssessmentStatements/CreateAddedAssessmentPriceAssetStatementsCreator';
import { CreateConstructionAssessmentStatements } from './CreateAssessmentStatements/CreateConstructionAssessmentStatements';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { buildAssessment } from '@/Domain/Service/CreateNewAssessmentService/buildAssessment';

export class CreateNewAssessmentService {
    constructor(
        public contractable: Contractable,
        public contract: Contract,
        public costDocument?: CostDocument,
    ) {}

    async invoke(): Promise<Assessment> {
        const costDocument =
            this.costDocument || (await fetchCostDocument(this.contract));
        if (this.contract.designId) {
            const assessmentStatements =
                await new CreateDesignAssessmentStatements(
                    this.contractable,
                    this.contract,
                    costDocument,
                ).invoke();
            const takenOverAssessmentStatements =
                await this.takeOverExistingIsOpen(assessmentStatements);
            return buildAssessment(
                takenOverAssessmentStatements,
                this.contractable,
                this.contract,
            );
        } else {
            const addedAssessmentPriceAssetStatements =
                await new CreateAddAssessmentPriceAssetStatementsCreator(
                    this.contractable,
                    this.contract,
                ).invoke();
            const beforeAssessmentStatements = this.contractable.prevContract
                ? await AssessmentStatementRepository.findByContract(
                      this.contractable.prevContract.id,
                  )
                : undefined;
            const assessmentStatements =
                await new CreateConstructionAssessmentStatements(
                    this.contract,
                    costDocument,
                    addedAssessmentPriceAssetStatements,
                    this.contractable,
                    beforeAssessmentStatements,
                ).invoke();
            const takenOverAssessmentStatements =
                await this.takeOverExistingIsOpen(assessmentStatements);
            return buildAssessment(
                takenOverAssessmentStatements,
                this.contractable,
                this.contract,
                addedAssessmentPriceAssetStatements,
            );
        }
    }

    private async takeOverExistingIsOpen(statements: AssessmentStatement[]) {
        const existingAssessmentStatements =
            await AssessmentStatementRepository.findByContract(
                this.contract.id,
            );
        return statements.map(statement => {
            const targetStatement = existingAssessmentStatements.find(
                target =>
                    target.part === statement.part &&
                    target.name === statement.name,
            );
            if (!targetStatement) return statement;

            return { ...statement, isOpen: targetStatement.isOpen };
        });
    }
}
