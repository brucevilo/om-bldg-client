import { RetirementCostItem } from './';
import { AttachmentInfo } from '@/Domain/ValueObject';

export class Retirement {
    constructor(
        public id: number,
        public retirementCostItems: RetirementCostItem[],
        public constructionStatementId: number | null,
        public retirementedAt: Date,
        public constructionId: number,
        public csvIkkatuUploadInfo: AttachmentInfo,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
