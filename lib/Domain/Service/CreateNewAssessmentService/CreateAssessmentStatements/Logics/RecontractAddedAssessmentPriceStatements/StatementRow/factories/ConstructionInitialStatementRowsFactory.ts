import { AssetStatement } from '@/Domain/Entity';
import { AssessmentStatementRow } from '..';
import { assertsIsNotNull } from '@/Infrastructure';

export class ConstructionInitialStatementRowsFactory {
    constructor(
        private assetStatements: AssetStatement[],
        private beforeContractStatements: AssetStatement[],
    ) {}
    create(): AssessmentStatementRow[] {
        const currentExistStatementRows = this.assetStatements.map(
            assetStatement => {
                const targetBeforeContractStatement =
                    this.beforeContractStatements.find(
                        b =>
                            b.constructionTypeSerialNumber ===
                            assetStatement.constructionTypeSerialNumber,
                    );
                return new AssessmentStatementRow(
                    assetStatement.distributedPrice,
                    targetBeforeContractStatement?.assessmentPrice || 0,
                    assetStatement.name,
                    undefined,
                    assetStatement.constructionStatementId,
                );
            },
        );
        const lostFromBeforeContractStatementRows =
            this.beforeContractStatements.flatMap(bcs => {
                const targetCurrentStatement = this.assetStatements.find(
                    currentAssetStatement => {
                        return (
                            currentAssetStatement.constructionTypeSerialNumber ===
                            bcs.constructionTypeSerialNumber
                        );
                    },
                );
                if (targetCurrentStatement) return [];
                assertsIsNotNull(
                    bcs.assessmentPrice,
                    '前回契約明細に金額がありません',
                );

                return new AssessmentStatementRow(
                    0,
                    bcs.assessmentPrice,
                    bcs.name,
                    undefined,
                    bcs.constructionStatementId,
                );
            });
        return currentExistStatementRows.concat(
            lostFromBeforeContractStatementRows,
        );
    }
}
