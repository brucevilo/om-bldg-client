import {
    ConstructionInformationSummary,
    AssetAndUnitSummary,
} from '@/Domain/ValueObject';
import { AssetStatement } from '@/Domain/Entity';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { SapRecordParamsForAssetStatementUpdate } from '@/Domain/Repository';

export class UploadSapRecordFromImportedManageSheetService {
    public static createSapRecordParamsForAssetStatementUpdate(
        assetStatements: AssetStatement[],
        constructionInformationSummaries: ConstructionInformationSummary[],
        assetAndUnitSummaries: AssetAndUnitSummary[],
    ): SapRecordParamsForAssetStatementUpdate[] {
        const assetStatementsWithoutCost = assetStatements.filter(
            as => !as.assetClass?.name.match(/費用計上/),
        );
        const sapRecordParamsForAssetStatementUpdate =
            assetStatementsWithoutCost.flatMap(as => {
                const constructionInformationSummary =
                    this.findConstructionInformationSummaryFromAssetStatement(
                        as,
                        constructionInformationSummaries,
                    );
                assertsIsExists(
                    constructionInformationSummary,
                    '対応する工事情報入力シートの行がありません',
                );

                const assetAndUnitSummary =
                    this.findAssetUnitSummaryFromConstructionInformationSummary(
                        constructionInformationSummary,
                        assetAndUnitSummaries,
                    );
                if (!assetAndUnitSummary) return [];
                assertsIsNotNull(as.id, '資産にIDがありません');

                return {
                    assetStatementId: as.id,
                    sapWbsCode: assetAndUnitSummary.sapWbsCode,
                    sapBusinessCode:
                        constructionInformationSummary.sapBusinessCode,
                    sapRecordedAt: assetAndUnitSummary.sapRecordedAt,
                };
            });
        return sapRecordParamsForAssetStatementUpdate;
    }

    private static findConstructionInformationSummaryFromAssetStatement(
        assetStatement: AssetStatement,
        constructionInformationSummaries: ConstructionInformationSummary[],
    ) {
        const constructionInformationSummary =
            constructionInformationSummaries.find(summary => {
                return (
                    summary.constructionTypeSerialNumber ===
                    assetStatement.constructionTypeSerialNumber
                );
            });
        return constructionInformationSummary;
    }

    private static findAssetUnitSummaryFromConstructionInformationSummary(
        constructionInformationSummary: ConstructionInformationSummary,
        assetAndUnitSummaries: AssetAndUnitSummary[],
    ) {
        const assetAndUnitSummary = assetAndUnitSummaries.find(
            summary =>
                summary.sapWbsCode ===
                    constructionInformationSummary.sapWbsCode &&
                summary.businessCodeName ===
                    constructionInformationSummary.businessCodeName &&
                summary.assetName ===
                    constructionInformationSummary.assetName &&
                summary.assetText ===
                    constructionInformationSummary.assetText &&
                summary.assetClassName ===
                    constructionInformationSummary.assetClassName,
        );
        return assetAndUnitSummary;
    }
}
