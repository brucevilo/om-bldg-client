import { AssetChecklist } from '../Entity';

export interface AssetChecklistResponse {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export class AssetChecklistFactory {
    static createFromResponse(res: AssetChecklistResponse): AssetChecklist {
        return new AssetChecklist(
            res.id,
            res.user_id,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
