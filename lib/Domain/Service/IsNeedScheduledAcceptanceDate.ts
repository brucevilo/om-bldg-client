import { ConstructionStatement } from '@/Domain/Entity';

export const isNeedScheduledAcceptanceDate = (
    constructionStatements: ConstructionStatement[],
): ConstructionStatement[] => {
    return constructionStatements.filter(
        cs =>
            cs.scheduledAcceptanceDate === null &&
            cs.term.getMonth() + 1 === new Date().getMonth() + 2,
    );
};
