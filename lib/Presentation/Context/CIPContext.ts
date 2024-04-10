import {
    Construction,
    ConstructionStatement,
    AssetStatement,
    Design,
} from '@/Domain/Entity';
import { createContext } from 'react';

export const CIPContext = createContext<{
    construction: Construction;
    designs: Design[];
    constructionStatements: ConstructionStatement[];
    assetStatements: AssetStatement[];
    selectedConstructionStatementIds: number[];
    onChangeSelectedConstructionStatementIds: (ids: number[]) => void;
} | null>(null);
