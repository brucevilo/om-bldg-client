import { Contract, AssessmentStatement } from '../../../../../Entity';
import { CreateStatementRowsDirector } from './StatementRow/builders/CreateStatementRowsDirector';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import {
    fullWidthRightCircleBracketsToHalfSize,
    stringAdaptFormats,
} from '@/App/utils/stringAdaptformats';
import { AssessmentStatementRow } from './StatementRow';
import { DesignInitialStatementRowsFactory } from './StatementRow/factories/DesignInitialStatementRowsFactory';

export class ReContractBuildAssessmentStatementsService {
    // 初期値として必要な項目は以下
    // 今回の予定価格明細金額と前回の査定表明細(既発注工事費)の差額
    // 前回の契約金額合計
    constructor(
        private contract: Contract,
        private beforeContract: Contract,
        private estimateStatements: AssessmentStatement[],
        private beforeContractStatements: AssessmentStatement[],
    ) {}
    invoke(): AssessmentStatement[] {
        const initialStatementRows = new DesignInitialStatementRowsFactory(
            this.estimateStatements,
            this.beforeContractStatements,
        ).create();
        const statementRows = new CreateStatementRowsDirector(
            this.contract,
            this.beforeContract,
            initialStatementRows,
        ).invoke();

        const statementsIncludeAssessmentPrice =
            this.createStatementsIncludeAssessmentPrice(statementRows);
        return statementsIncludeAssessmentPrice;
    }

    private createStatementsIncludeAssessmentPrice(
        statementRows: AssessmentStatementRow[],
    ) {
        const statements = this.estimateStatements.map(statement => {
            const targetStatementRow = statementRows.find(statementRow => {
                return (
                    stringAdaptFormats(
                        statementRow.name,
                        fullWidthRightCircleBracketsToHalfSize,
                    ) ===
                        stringAdaptFormats(
                            statement.name,
                            fullWidthRightCircleBracketsToHalfSize,
                        ) &&
                    stringAdaptFormats(
                        statementRow.part || '',
                        fullWidthRightCircleBracketsToHalfSize,
                    ) ===
                        stringAdaptFormats(
                            statement.part,
                            fullWidthRightCircleBracketsToHalfSize,
                        )
                );
            });
            assertsIsExists(
                targetStatementRow,
                '対象の査定表明細列が存在しません',
            );
            assertsIsNotNull(
                targetStatementRow.getContractedPrice,
                '査定表の金額が算出されていません',
            );
            statement.price = targetStatementRow.getContractedPrice;
            return statement;
        });
        return statements;
    }
}
