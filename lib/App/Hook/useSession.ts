import { useState, useEffect } from 'react';
import { Session } from '@/Domain/Entity';
import { SessionService } from '../Service';

export const useSession = (): Session | false | null => {
    const [session, setSession] = useState<Session | false | null>(null);
    useEffect(() => {
        SessionService.restore().then(session => setSession(session || false));
    }, []);
    return session;
};
