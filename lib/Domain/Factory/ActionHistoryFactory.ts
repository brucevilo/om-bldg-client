import { ActionHistory } from '@/Domain/Entity';
import { UserFactory, UserResponseObject } from './UserFactory';

export interface ActionHistoryResponse {
    id: number;
    user_id: number;
    design_id: number | null;
    construction_id: number | null;
    asset_statement_id: number | null;
    details: string;
    user: UserResponseObject;
    created_at: string;
    updated_at: string;
}

export class ActionHistoryFactory {
    static createFromResponse(res: ActionHistoryResponse): ActionHistory {
        return new ActionHistory(
            res.id,
            res.user_id,
            res.design_id,
            res.construction_id,
            res.asset_statement_id,
            res.details,
            UserFactory.createFromResponseObject(res.user),
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
