import { AssetStatementFactory, AssetStatementResponse } from '.';
import { dummyAssetStatementResponse } from '@/__test__/dummy';

test('レスポンスから資産明細を作成', () => {
    const res: AssetStatementResponse = dummyAssetStatementResponse();
    const assetStatement = AssetStatementFactory.createFromResponse(res);
    expect(assetStatement.id).toBe(res.id);
    expect(assetStatement.constructionStatementId).toBe(
        res.construction_statement_id,
    );
    expect(assetStatement.assetClass?.id).toBe(res.asset_class?.id);
    expect(assetStatement.name).toBe(res.name);
    expect(assetStatement.distributedPrice).toBe(res.distributed_price);
    expect(assetStatement.sapKey).toBe(res.sap_key);
    expect(assetStatement.sapRecordedAt?.toISOString()).toBe(
        res.sap_recorded_at,
    );
    expect(assetStatement.sapRecordedPrice).toBe(res.sap_recorded_price);
    expect(assetStatement.sapFixedAssetId).toBe(res.sap_fixed_asset_id);
    expect(assetStatement.constructionTypeSerialNumber).toBe(
        res.construction_type_serial_number,
    );
    expect(assetStatement.distributedDesignCost).toBe(500);
    expect(assetStatement.createdAt.toISOString()).toBe(res.created_at);
    expect(assetStatement.updatedAt.toISOString()).toBe(res.updated_at);
});
