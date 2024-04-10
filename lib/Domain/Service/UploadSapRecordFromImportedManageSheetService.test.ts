import { UploadSapRecordFromImportedManageSheetService } from '@/Domain/Service';
import {
    dummyConstructionInformationSummary,
    dummyAssetAndUnitSummary,
    dummyAssetStatement,
} from '@/__test__/dummy';

test('UploadSapRecordFromImportedManageSheetService createSapRecordParamsForAssetStatementUpdate', () => {
    const constructionInformationSummaries = [
        dummyConstructionInformationSummary(),
    ];
    const assetAndUnitSummaries = [dummyAssetAndUnitSummary()];
    const assetStatements = [dummyAssetStatement()];

    const sapRecordParamsForAssetStatementUpdate =
        UploadSapRecordFromImportedManageSheetService.createSapRecordParamsForAssetStatementUpdate(
            assetStatements,
            constructionInformationSummaries,
            assetAndUnitSummaries,
        );
    expect(sapRecordParamsForAssetStatementUpdate.length).toBe(1);
    expect(sapRecordParamsForAssetStatementUpdate[0].assetStatementId).toBe(
        assetStatements[0].id,
    );
    expect(sapRecordParamsForAssetStatementUpdate[0].sapBusinessCode).toBe(
        constructionInformationSummaries[0].sapBusinessCode,
    );
    expect(sapRecordParamsForAssetStatementUpdate[0].sapWbsCode).toBe(
        assetAndUnitSummaries[0].sapWbsCode,
    );
    expect(
        sapRecordParamsForAssetStatementUpdate[0].sapRecordedAt.toISOString(),
    ).toBe(assetAndUnitSummaries[0].sapRecordedAt.toISOString());
});
