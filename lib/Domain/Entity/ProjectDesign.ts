import { Entity, Timestamps } from '.';

export class ProjectDesign implements Entity, Timestamps {
    constructor(
        public id: number | null,
        public projectId: number,
        public designId: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
