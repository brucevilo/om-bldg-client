import { Entity, Timestamps } from '.';

export class ProjectConstruction implements Entity, Timestamps {
    constructor(
        public id: number | null,
        public projectId: number,
        public constructionId: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
