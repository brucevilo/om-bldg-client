import { AssetStatement, Contract } from '@/Domain/Entity';
import { AssetStatementRepository } from '@/Domain/Repository';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { BuildAdjustAssessmentStatementsService } from '../Logics/BuildAdjustAssessmentStatementsService';

export class ConstructionContractAddedAssessmentPriceAssetStatementsCreator {
    constructor(private contract: Contract) {}

    public async create(): Promise<AssetStatement[]> {
        assertsIsNotNull(this.contract.constructionId);
        const assetStatements =
            await AssetStatementRepository.listByConstruction(
                this.contract.constructionId,
                this.contract.id,
            );
        const adjustAssessmentStatements =
            new BuildAdjustAssessmentStatementsService(this.contract, {
                contractableTypeIsConstruction: true,
                statements: assetStatements,
            }).invoke();
        return assetStatements.map(estimateStatement => {
            const targetAdjustStatement = adjustAssessmentStatements.find(
                adjustStatement => {
                    return (
                        adjustStatement.constructionStatementId ===
                            estimateStatement.constructionStatementId &&
                        adjustStatement.name === estimateStatement.name
                    );
                },
            );
            assertsIsExists(targetAdjustStatement);
            assertsIsNotNull(targetAdjustStatement.correctedPrice);

            const assetStatement = estimateStatement.copy();
            assetStatement.assessmentPrice =
                targetAdjustStatement.correctedPrice;
            return assetStatement;
        });
    }
}
