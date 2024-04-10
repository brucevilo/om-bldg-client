import { AssetStatement, Contract, Contractable } from '@/Domain/Entity';
import { AssetStatementRepository } from '@/Domain/Repository';
import { assertsIsNotNull } from '@/Infrastructure';
import { ReContractBuildAssessmentStatementsService } from '../Logics/RecontractAddedAssessmentPriceStatements/ReContractBuildAssetStatementsService';

export class ConstructionReContractAddedAssessmentPriceAssetStatementsCreator {
    constructor(
        private contract: Contract,
        private contractable: Contractable,
    ) {}

    public async create(): Promise<AssetStatement[]> {
        assertsIsNotNull(this.contract.constructionId);
        const estimateAssetStatements =
            await AssetStatementRepository.listByConstruction(
                this.contract.constructionId,
                this.contract.id,
            );
        const beforeContract = this.contractable.prevContract;
        assertsIsNotNull(beforeContract);
        const beforeContractAssetStatements =
            await AssetStatementRepository.listByConstruction(
                this.contract.constructionId,
                beforeContract.id,
            );
        const assetStatements = new ReContractBuildAssessmentStatementsService(
            this.contract,
            beforeContract,
            estimateAssetStatements,
            beforeContractAssetStatements,
        ).invoke();

        return assetStatements;
    }
}
