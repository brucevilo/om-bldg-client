import { AssessmentStatement } from '@/Domain/Entity';
import { AssessmentStatementRow } from '..';
import { assertsIsNotNull } from '@/Infrastructure';

export class DesignInitialStatementRowsFactory {
    constructor(
        private estimateStatements: AssessmentStatement[],
        private beforeContractStatements: AssessmentStatement[],
    ) {}
    create(): AssessmentStatementRow[] {
        const currentExistStatementRows = this.estimateStatements.map(
            estimateStatement => {
                const targetBeforeContractStatement =
                    this.beforeContractStatements.find(
                        b =>
                            b.name === estimateStatement.name &&
                            b.part === estimateStatement.part,
                    );
                return new AssessmentStatementRow(
                    estimateStatement.costDocumentPrice,
                    targetBeforeContractStatement?.price || 0,
                    estimateStatement.name,
                    estimateStatement.part,
                );
            },
        );
        const lostFromBeforeContractStatementRows =
            this.beforeContractStatements.flatMap(bcs => {
                const targetCurrentStatement = this.estimateStatements.find(
                    e => {
                        return e.name === bcs.name && e.part === bcs.part;
                    },
                );
                if (targetCurrentStatement) return [];
                assertsIsNotNull(bcs.price, '前回契約明細に金額がありません');

                return new AssessmentStatementRow(
                    0,
                    bcs.price,
                    bcs.name,
                    bcs.part,
                );
            });
        return currentExistStatementRows.concat(
            lostFromBeforeContractStatementRows,
        );
    }
}
