import { CostItemTag } from '../Entity';

export interface CostItemTagResponse {
    id: number;
    cost_item_id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export class CostItemTagFactory {
    static createFromResponse(res: CostItemTagResponse): CostItemTag {
        return new CostItemTag(
            res.id,
            res.cost_item_id,
            res.name,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
