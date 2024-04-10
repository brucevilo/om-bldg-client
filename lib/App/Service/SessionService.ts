import { Session } from '@/Domain/Entity';
import {
    getNoAuthClient,
    getClient,
    getAccessToken,
    setAccessToken,
    deleteAccessToken,
} from '@/Infrastructure';
import { SessionRepository } from '@/Domain/Repository';

export interface PasswordResetParams {
    password: string;
    password_confirmation: string;
}

interface SignInRequest {
    email: string;
    password: string;
}

export class SessionService {
    static async login(email: string, password: string): Promise<Session> {
        const res = await getNoAuthClient().post<SignInRequest, Session>(
            '/sessions',
            { email, password },
        );
        const session = res.data;
        setAccessToken(session.token);
        return session;
    }

    static async signOut(id: number): Promise<void> {
        await getClient().delete(`/sessions/${id}`);
        return;
    }

    static async restore(): Promise<Session | null> {
        const token = getAccessToken();
        if (!token) return null;
        try {
            const session = await SessionRepository.findByToken(token);
            return session;
        } catch {
            return null;
        }
    }

    static logout(): void {
        deleteAccessToken();
        return;
    }

    static async onPasswordReset(email: string): Promise<void> {
        await getNoAuthClient().post('/password_reset', {
            email,
        });
    }

    static async passwordResetComplete(
        params: PasswordResetParams,
        token: string,
    ): Promise<Session> {
        const res = await getNoAuthClient().post<
            { password: string; password_confirmation: string; token: string },
            Session
        >('/password_reset/complete', {
            ...params,
            token,
        });
        const session = res.data;
        setAccessToken(session.token);
        return session;
    }
}
