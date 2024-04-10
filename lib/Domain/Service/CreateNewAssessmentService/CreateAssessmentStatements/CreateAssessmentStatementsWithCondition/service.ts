import { AssessmentStatement } from '@/Domain/Entity';

export const createLinkedBeforeContractConstructionTypeSerialNumber = (
    currentStatements: AssessmentStatement[],
    beforeContractAssessmentStatements: AssessmentStatement[],
): AssessmentStatement[] => {
    if (!beforeContractAssessmentStatements) {
        throw Error('beforeContractAssessmentStatementsがありません');
    }
    const statements = currentStatements.map(statement => {
        const targetBeforeStatement = beforeContractAssessmentStatements.find(
            beforeStatement => {
                return (
                    statement.name === beforeStatement.name &&
                    statement.part === beforeStatement.part
                );
            },
        );
        const constructionTypeSerialNumberParams = targetBeforeStatement
            ? {
                  constructionTypeSerialNumber:
                      targetBeforeStatement.constructionTypeSerialNumber,
              }
            : {};
        return {
            ...statement,
            ...constructionTypeSerialNumberParams,
        };
    });
    return statements;
};

export const linkBeforeAssessmentStatementId = (
    currentStatements: AssessmentStatement[],
    estimateAssessmentStatements: AssessmentStatement[],
): AssessmentStatement[] => {
    return currentStatements.map(statement => {
        const targetBeforeStatement = estimateAssessmentStatements.find(
            beforeStatement => {
                return (
                    statement.name === beforeStatement.name &&
                    statement.part === beforeStatement.part
                );
            },
        );
        if (!targetBeforeStatement || !targetBeforeStatement.id) {
            throw Error('estimate時のAssessmentStatementがありません');
        }
        return {
            ...statement,
            id: targetBeforeStatement.id,
        };
    });
};
