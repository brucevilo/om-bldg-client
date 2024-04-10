import { getClient } from '@/Infrastructure';
import { UserResponseObject, UserFactory } from '../Factory';
import { User } from '../Entity';
import { EditUserForm } from '@/App/Service';

interface EditUserRequest {
    name: string | null;
    department: string;
    name_code: string;
    email: string;
    admin: boolean;
}
interface EditUserAndPasswordRequest {
    name: string | null;
    department: string;
    name_code: string;
    email: string;
    admin: boolean;
    password: string;
    password_confirmation: string;
}
interface UserFileRequest {
    file: File;
}

export class UserRepository {
    static async list(): Promise<User[]> {
        const res = await getClient().get<UserResponseObject[]>('/users');
        return res.data.map(UserFactory.createFromResponseObject);
    }

    static async downloadCsv(): Promise<void> {
        const res = await getClient().get<string>('/users/csv');
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const url = URL.createObjectURL(new Blob([bom, res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'users.csv');
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
    }

    static async store({
        id,
        name,
        department,
        nameCode,
        email,
        admin,
        password,
        passwordConfirmation,
    }: EditUserForm): Promise<User> {
        const res = id
            ? await getClient().patch<
                  EditUserRequest | EditUserAndPasswordRequest,
                  UserResponseObject
              >(
                  `/users/${id}`,
                  password
                      ? {
                            name,
                            department,
                            name_code: nameCode,
                            email,
                            admin,
                            password,
                            password_confirmation: passwordConfirmation,
                        }
                      : {
                            name,
                            department,
                            name_code: nameCode,
                            email,
                            admin,
                        },
              )
            : await getClient().post<
                  EditUserAndPasswordRequest,
                  UserResponseObject
              >('/users', {
                  name,
                  department,
                  name_code: nameCode,
                  email,
                  admin,
                  password,
                  password_confirmation: passwordConfirmation,
              });
        return UserFactory.createFromResponseObject(res.data);
    }

    static async storeCsv(csvFile: File): Promise<User> {
        const params: UserFileRequest = {
            file: csvFile,
        };
        const res = await getClient().formPost<
            UserFileRequest,
            UserResponseObject
        >('/users/csv', params);
        return UserFactory.createFromResponseObject(res.data);
    }
}
