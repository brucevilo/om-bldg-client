import { AssetStatement, Contract, Contractable } from '@/Domain/Entity';
import { ConstructionContractAddedAssessmentPriceAssetStatementsCreator } from '@/Domain/Service/CreateNewAssessmentService/CreateAssessmentStatements/CreateAddedAssessmentPriceAssetStatementsCreator/ConstructionContractAddedAssessmentPriceAssetStatementsCreator';
import { ConstructionReContractAddedAssessmentPriceAssetStatementsCreator } from '@/Domain/Service/CreateNewAssessmentService/CreateAssessmentStatements/CreateAddedAssessmentPriceAssetStatementsCreator/ConstructionReContractAddedAssessmentPriceAssetStatementsCreator';

export class CreateAddAssessmentPriceAssetStatementsCreator {
    constructor(
        private contractable: Contractable,
        private contract: Contract,
    ) {}
    public async invoke(): Promise<AssetStatement[]> {
        if (!this.contract.contractedPrice) {
            throw Error(
                '契約前の工事でAssessmentStatementの算出は想定していない',
            );
        }

        if (this.contractable.contracts.length > 1) {
            return await new ConstructionReContractAddedAssessmentPriceAssetStatementsCreator(
                this.contract,
                this.contractable,
            ).create();
        }
        return await new ConstructionContractAddedAssessmentPriceAssetStatementsCreator(
            this.contract,
        ).create();
    }
}
