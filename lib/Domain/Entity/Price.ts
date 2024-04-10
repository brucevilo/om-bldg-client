import { Entity, Timestamps } from '.';

export class Price implements Entity, Timestamps {
    /**
     * 単価表
     * @param name 名称
     * @param shapeDimension 形状寸法
     * @param price 単価
     */
    constructor(
        public id: number | null,
        public code: string,
        public name: string,
        public shapeDimension: string,
        public price: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
