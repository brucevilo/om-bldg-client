import { CIP } from '../Entity';
import { AttachmentInfo } from '../ValueObject';

export interface CIPResponse {
    id: number;
    handover_document_info: AttachmentInfo;
    memo: string;
    created_at: string;
    updated_at: string;
}

export class CIPFactory {
    static createFromResponse(res: CIPResponse): CIP {
        return new CIP(
            res.id,
            res.handover_document_info,
            res.memo,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
