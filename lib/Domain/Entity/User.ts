import { Entity } from './Entity';

export class User implements Entity {
    constructor(
        public id: number,
        public name: string,
        public nameCode: string,
        public department: string,
        public email: string,
        public admin: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
