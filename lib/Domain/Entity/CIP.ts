import { AttachmentInfo } from '../ValueObject';

/**
 * Construction In Progress
 * 建設仮勘定
 */
export class CIP {
    constructor(
        public id: number,
        public handoverDocumentInfo: AttachmentInfo,
        public memo: string,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
