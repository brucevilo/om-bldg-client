import { User } from '@/Domain/Entity';

export interface EditUserForm {
    id: number;
    name: string;
    department: string;
    nameCode: string;
    email: string;
    admin: boolean;
    password: string;
    passwordConfirmation: string;
}

export class EditUser {
    static createEmptyForm(): EditUserForm {
        return {
            id: 0,
            name: '',
            department: '',
            nameCode: '',
            email: '',
            admin: false,
            password: '',
            passwordConfirmation: '',
        };
    }

    static userToForm(user: User): EditUserForm {
        return {
            id: user.id,
            name: user.name,
            department: user.department,
            nameCode: user.nameCode,
            email: user.email,
            admin: user.admin,
            password: '',
            passwordConfirmation: '',
        };
    }

    static formToUser(form: EditUserForm): User {
        return new User(
            form.id,
            form.name,
            form.nameCode,
            form.department,
            form.email,
            form.admin,
            new Date(),
            new Date(),
        );
    }
}
