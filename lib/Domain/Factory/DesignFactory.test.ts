import { DesignFactory, DesignResponse } from './DesignFactory';
import { DesignContractType } from '../Entity/Design';
import { MigrationStatus } from '../Entity';

test('レスポンスから設計を作成', () => {
    const res: DesignResponse = {
        id: 1,
        name: '中ふ頭外２駅トイレ改造その他工事　その１',
        'contract_type': DesignContractType.Internal,
        memo: '設計のメモ',
        document_number: '20221212',
        contracts: [],
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
        made_by_migration: true,
        migration_status: MigrationStatus.Open,
    };

    const design = DesignFactory.createFromResponse(res);
    expect(design.id).toBe(res.id);
    expect(design.name).toBe(res.name);
    expect(design.contractType).toBe(res.contract_type);
    expect(design.memo).toBe(res.memo);
    expect(design.documentNumber?.dividedHyphen).toBe('2022-1212');
    expect(design.createdAt.toISOString()).toBe(res.created_at);
    expect(design.updatedAt.toISOString()).toBe(res.updated_at);
    expect(design.madeByMigration).toBe(res.made_by_migration);
    expect(design.migrationStatus).toBe(res.migration_status);
});
