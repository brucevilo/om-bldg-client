import { UserFactory, UserResponseObject } from '.';
import { Session } from '@/Domain/Entity';

export interface SessionResponseObject {
    id: number;
    user: UserResponseObject;
    token: string;
    created_at: string;
    updated_at: string;
}

export class SessionFactory {
    static createFromResponseObject(res: SessionResponseObject): Session {
        const user = UserFactory.createFromResponseObject(res.user);
        return new Session(
            res.id,
            user,
            res.token,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
