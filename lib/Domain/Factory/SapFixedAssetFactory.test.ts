import {
    SapFixedAssetResponse,
    SapFixedAssetFactory,
} from './SapFixedAssetFactory';

test('レスポンスからSAP固定資産台帳を作成', () => {
    const res: SapFixedAssetResponse = {
        id: 1,
        user_id: 1,
        key: '10070100006749',
        asset_name: '中津駅(R1)建物',
        asset_text: '2016_中津駅駅施設改造に伴うサードレール工事及びその他工事',
        recorded_at: new Date('2019-01-01').toISOString(),
        business_code: '10500701',
        wbs_code: 'D2185705-AD181051-DABT1',
        asset_class_code: '10500701',
        term_end_price: 56_433,
        asset_checklists: [],
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };

    const sapFixedAsset = SapFixedAssetFactory.createFromResponse(res);
    expect(sapFixedAsset.id).toBe(res.id);
    expect(sapFixedAsset.userId).toBe(res.user_id);
    expect(sapFixedAsset.key).toBe(res.key);
    expect(sapFixedAsset.assetName).toBe(res.asset_name);
    expect(sapFixedAsset.assetText).toBe(res.asset_text);
    expect(sapFixedAsset.recordedAt.toISOString()).toBe(res.recorded_at);
    expect(sapFixedAsset.businessCode).toBe(res.business_code);
    expect(sapFixedAsset.wbsCode).toBe(res.wbs_code);
    expect(sapFixedAsset.assetClassCode).toBe(res.asset_class_code);
    expect(sapFixedAsset.termEndPrice).toBe(res.term_end_price);
    expect(sapFixedAsset.createdAt.toISOString()).toBe(res.created_at);
    expect(sapFixedAsset.updatedAt.toISOString()).toBe(res.updated_at);
});
