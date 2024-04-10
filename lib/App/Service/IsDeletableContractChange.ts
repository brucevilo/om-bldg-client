import { Construction, ConstructionStatement } from '@/Domain/Entity';

export const isDeletableContractChange = (
    construction: Construction,
    constructionStatements: ConstructionStatement[],
): boolean => {
    if (
        construction.contracts.length > 1 &&
        !constructionStatements.find(
            cs =>
                (cs.contractId === construction.latestContract.id &&
                    cs.isConstructionInProgressCompleted) ||
                (cs.contractId === construction.latestContract.id &&
                    cs.isRetiremented),
        )
    ) {
        return true;
    } else {
        return false;
    }
};
