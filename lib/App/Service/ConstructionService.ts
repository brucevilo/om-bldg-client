import { Construction, ConstructionStatementHistory } from '@/Domain/Entity';
import { orderBy } from 'lodash';

export const getConstructionStatementHistoriesFromConstructions = (
    constructions: Construction[],
): ConstructionStatementHistory[] => {
    const contracts = constructions.flatMap(
        construction => construction.contracts,
    );

    const constructionStatements = contracts.flatMap(
        contract => contract.constructionStatements,
    );

    const csHistories = constructionStatements.flatMap(
        cs => cs.constructionStatementHistories,
    );

    return orderBy(csHistories, ['createdAt'], ['desc']);
};
