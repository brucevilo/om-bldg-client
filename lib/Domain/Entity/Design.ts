import { Entity, Timestamps, Contract, Contractable, MigrationStatus } from '.';
import { DocumentNumber } from '../ValueObject/DocumentNumber';

export enum DesignContractType {
    Internal = 'internal',
    External = 'external',
}

export class Design extends Contractable implements Entity, Timestamps {
    /**
     * 設計
     * @param name 設計名
     * @param contractType 設計委託先
     * @param note メモ
     * @param madeByMigration 移行ツール経由で作成された物のみtrue、通常フローはfalseで登録
     */
    constructor(
        public id: number | null,
        public name: string,
        public contractType: DesignContractType,
        public memo: string,
        public documentNumber: DocumentNumber | null,
        public contracts: Contract[],
        public createdAt: Date,
        public updatedAt: Date,
        public madeByMigration: boolean,
        public migrationStatus: MigrationStatus,
    ) {
        super();
    }

    get contractTypeText(): string {
        if (this.contractType === DesignContractType.External) {
            return '外注';
        }
        return '内製';
    }
}
