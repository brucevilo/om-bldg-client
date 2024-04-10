import { User, Entity, Timestamps } from '.';

export class Session implements Entity, Timestamps {
    constructor(
        public id: number,
        public user: User,
        public token: string,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
