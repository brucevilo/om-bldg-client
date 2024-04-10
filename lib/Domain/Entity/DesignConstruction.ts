import { Entity, Timestamps } from '.';

export class DesignConstruction implements Entity, Timestamps {
    constructor(
        public id: number | null,
        public designId: number,
        public constructionId: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
