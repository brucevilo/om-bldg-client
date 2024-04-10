import { ConstructionResponse, ConstructionFactory } from '.';
import { MigrationStatus } from '../Entity';

test('レスポンスから工事を作成', () => {
    const res: ConstructionResponse = {
        id: 1,
        name: '中ふ頭外２駅トイレ改造その他工事',
        contracts: [],
        document_number: '20221111',
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
        made_by_migration: true,
        migration_status: MigrationStatus.Open,
    };

    const construction = ConstructionFactory.createFromResponse(res);
    expect(construction.id).toBe(res.id);
    expect(construction.name).toBe(res.name);
    expect(construction.createdAt.toISOString()).toBe(res.created_at);
    expect(construction.updatedAt.toISOString()).toBe(res.updated_at);
    expect(construction.documentNumber.dividedHyphen).toBe('2022-1111');
    expect(construction.madeByMigration).toBe(true);
    expect(construction.migrationStatus).toBe(res.migration_status);
});
