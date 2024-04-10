import { Entity, Timestamps } from '.';
import { AttachmentInfo } from '../ValueObject';

export type ConstructionStatementHistoryFormValue =
    Partial<ConstructionStatementHistory> & {
        isUpdated: boolean;
        file: File | null;
    };
export class ConstructionStatementHistory implements Entity, Timestamps {
    constructor(
        public id: number | null,
        public constructionStatementId: number,
        public assetDifference: number,
        public repairFeeDifference: number,
        public removalFeeDifference: number,
        public constructionPeriod: Date | null,
        public scheduledAcceptanceDate: Date | null,
        public partialPayment: number,
        public partialPaymentAcceptanceDate: Date | null,
        public isDraft: boolean,
        public reasonForChange: string,
        public fileInfo: AttachmentInfo | null,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
