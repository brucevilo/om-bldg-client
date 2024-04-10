import { Entity, Timestamps } from '.';

export class Supplier implements Entity, Timestamps {
    /**
     * 業者
     * @param id 業者ID
     * @param name 業者名
     * @param code 仕入れ先コード
     * @param contact 業者連絡先
     */
    constructor(
        public id: number,
        public name: string,
        public code: number,
        public contact: string,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
