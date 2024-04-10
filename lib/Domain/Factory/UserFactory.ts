import { User } from '@/Domain/Entity';

export interface UserResponseObject {
    id: number;
    name: string;
    department: string;
    name_code: string;
    email: string;
    admin: boolean;
    created_at: string;
    updated_at: string;
}

export class UserFactory {
    static createFromResponseObject(res: UserResponseObject): User {
        return new User(
            res.id,
            res.name,
            res.name_code,
            res.department,
            res.email,
            res.admin,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }

    static toResponseObject(user: User): UserResponseObject {
        return {
            id: user.id,
            name: user.name,
            name_code: user.nameCode,
            department: user.department,
            email: user.email,
            admin: user.admin,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
        };
    }
}
