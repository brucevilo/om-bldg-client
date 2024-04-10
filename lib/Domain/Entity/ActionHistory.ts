import { User } from './User';

export class ActionHistory {
    constructor(
        public id: number,
        public userId: number,
        public designId: number | null,
        public constructionId: number | null,
        public assetStatementId: number | null,
        public details: string,
        public user: User,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
