import { SessionFactory, SessionResponseObject } from '@/Domain/Factory';
import { getNoAuthClient } from '@/Infrastructure';
import { Session } from '../Entity';

export class SessionRepository {
    static async findByToken(token: string): Promise<Session> {
        const res = await getNoAuthClient().get<SessionResponseObject>(
            `/sessions?token=${token}`,
        );
        return SessionFactory.createFromResponseObject(res.data);
    }
}
