import { Entity } from './Entity';
import { Timestamps } from './TimeStamps';

export class CostItemTag implements Entity, Timestamps {
    /**
     * 特定情報
     * @param name 特定情報名
     */
    constructor(
        public id: number | null,
        public costItemId: number | null,
        public name: string,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
