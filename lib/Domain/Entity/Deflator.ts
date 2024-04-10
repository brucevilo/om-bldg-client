import { Entity, Timestamps } from '.';

export class Deflator implements Entity, Timestamps {
    /**
     * デフレート率
     * @param id ID
     * @param year 年度
     * @param rate デフレート率
     */
    constructor(
        public id: number | null,
        public year: number,
        public rate: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
