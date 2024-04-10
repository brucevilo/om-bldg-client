import { Supplier, User } from '@/Domain/Entity';
import { createContext } from 'react';

export const MasterContext = createContext<{
    users: User[];
    suppliers: Supplier[];
}>({
    users: [],
    suppliers: [],
});
