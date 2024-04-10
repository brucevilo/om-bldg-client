import { Entity, Timestamps } from '.';

export class AssetChecklist implements Entity, Timestamps {
    constructor(
        public id: number,
        public userId: number,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
