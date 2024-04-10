import { Entity, Timestamps, Contract, Contractable } from '.';
import { DocumentNumber } from '../ValueObject/DocumentNumber';

export enum MigrationStatus {
    Open = 'open',
    InProgress = 'in_progress',
    Completed = 'completed',
}

export class Construction extends Contractable implements Entity, Timestamps {
    /**
     * 工事
     * @param madeByMigration 移行ツール経由で作成された物のみtrue、通常フローはfalseで登録
     */
    constructor(
        public id: number | null,
        public name: string,
        public documentNumber: DocumentNumber,
        public contracts: Contract[],
        public createdAt: Date,
        public updatedAt: Date,
        public madeByMigration: boolean,
        public migrationStatus: MigrationStatus,
    ) {
        super();
    }
}
