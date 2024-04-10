import { Contract } from '@/Domain/Entity';
import { assertsIsNotNull } from '@/Infrastructure';
import { cloneDeep } from 'lodash';
import { AssessmentStatementRow } from '..';
import { KamokufukusuuSheet } from '../../KamokufukusuuSheet';
import { KamokufukusuuSheetBuilder } from '../../KamokufukusuuSheet/builder';
import { StatementRowBuilder } from './StatementRowBuilder';

export class CreateStatementRowsDirector {
    private statementRows: AssessmentStatementRow[];
    constructor(
        private contract: Contract,
        private beforeContract: Contract,
        private _statementRows: AssessmentStatementRow[],
    ) {
        this.statementRows = cloneDeep(this._statementRows); // プロパティ自体を書き換えるためDeepCopyしたものを代入
    }

    public invoke(): AssessmentStatementRow[] {
        const statementRowBuilders = this.statementRows.map(
            statement => new StatementRowBuilder(statement),
        );
        const kamokufukusuuSheet = new KamokufukusuuSheet();
        const kamokufukusuuSheetBulder = new KamokufukusuuSheetBuilder(
            kamokufukusuuSheet,
            this.contract,
            this.beforeContract,
        );
        this.buildByOrder(
            this.statementRows,
            statementRowBuilders,
            kamokufukusuuSheet,
            kamokufukusuuSheetBulder,
        );
        return this.statementRows;
    }

    private buildByOrder(
        assessmentStatementRows: AssessmentStatementRow[],
        statementRowBuilders: StatementRowBuilder[],
        kamokufukusuuSheet: KamokufukusuuSheet,
        kamokufukusuuSheetBulder: KamokufukusuuSheetBuilder,
    ) {
        this.buildKamokufukusuuSheetPhase1(kamokufukusuuSheetBulder);
        this.buildStatementRowsPhase1(statementRowBuilders, kamokufukusuuSheet);
        this.buildKamokufukusuuSheetPhase2(
            kamokufukusuuSheetBulder,
            assessmentStatementRows,
        );
        this.buildStatementRowsPhase2(
            statementRowBuilders,
            kamokufukusuuSheet,
            assessmentStatementRows,
        );
        this.buildKamokufukusuuSheetPhase3(
            kamokufukusuuSheetBulder,
            assessmentStatementRows,
        );
        this.buildStatementRowsPhase3(
            statementRowBuilders,
            kamokufukusuuSheet,
            assessmentStatementRows,
        );
    }

    private buildKamokufukusuuSheetPhase1(
        kamokufukusuuSheetBulder: KamokufukusuuSheetBuilder,
    ) {
        kamokufukusuuSheetBulder.calcH294H291();
        kamokufukusuuSheetBulder.calcM294M291();
        kamokufukusuuSheetBulder.calcQ66();
        kamokufukusuuSheetBulder.calcM298T66();
    }

    private buildStatementRowsPhase1(
        statementRowBuilders: StatementRowBuilder[],
        kamokufukusuuSheet: KamokufukusuuSheet,
    ) {
        statementRowBuilders.forEach(builder => {
            builder.calcO(kamokufukusuuSheet);
            builder.calcP();
            builder.calcQ();
            builder.calcR(kamokufukusuuSheet);
        });
    }

    private buildKamokufukusuuSheetPhase2(
        kamokufukusuuSheetBulder: KamokufukusuuSheetBuilder,
        statementRows: AssessmentStatementRow[],
    ) {
        kamokufukusuuSheetBulder.calcS294(statementRows);
        kamokufukusuuSheetBulder.calcW297();
        kamokufukusuuSheetBulder.calcU297();
    }

    private createStatementsWithRank(statementRows: AssessmentStatementRow[]) {
        const sortedStatementRows = statementRows.slice().sort((a, b) => {
            assertsIsNotNull(a.t, 't列が入力されていません');
            assertsIsNotNull(b.t, 't列が入力されていません');
            return b.t - a.t;
        });
        let before = 1;
        const statementsWithRank = sortedStatementRows.map(
            (statement, index) => {
                assertsIsNotNull(statement.t, 't列が入力されていません');
                const beforeStatement = sortedStatementRows[index - 1];

                const rank =
                    beforeStatement?.t === statement.t ? before : index + 1;
                before = rank;
                return {
                    statement,
                    rank,
                };
            },
        );
        return statementsWithRank;
    }

    private findWFractionDigit(kamokufukusuuSheet: KamokufukusuuSheet) {
        const h291 = kamokufukusuuSheet.h291;
        assertsIsNotNull(h291);
        if (h291 === 0) return 0;
        const splitedH291 = h291.toString().split('');
        let digit = 2;
        while (digit < 10) {
            if (splitedH291[digit - 1] !== '0') {
                return digit;
            }
            digit += 1;
        }
        throw new Error('端数調整できませんでした');
    }

    private buildStatementRowsPhase2(
        statementRowBuilders: StatementRowBuilder[],
        kamokufukusuuSheet: KamokufukusuuSheet,
        statementRows: AssessmentStatementRow[],
    ) {
        const wFractionDigit = this.findWFractionDigit(kamokufukusuuSheet);
        statementRowBuilders.forEach(builder => {
            builder.calcT(kamokufukusuuSheet);
            builder.calcV(kamokufukusuuSheet);
            builder.calcW(wFractionDigit);
        });
        const statementsWithRank = this.createStatementsWithRank(statementRows);
        statementRowBuilders.forEach(builder => {
            builder.calcU(statementsWithRank);
            builder.calcY(kamokufukusuuSheet);
        });
    }

    private buildKamokufukusuuSheetPhase3(
        kamokufukusuuSheetBulder: KamokufukusuuSheetBuilder,
        statementRows: AssessmentStatementRow[],
    ) {
        kamokufukusuuSheetBulder.calcU298(statementRows);
        kamokufukusuuSheetBulder.calcU299();
    }

    private buildStatementRowsPhase3(
        statementRowBuilders: StatementRowBuilder[],
        kamokufukusuuSheet: KamokufukusuuSheet,
        statementRows: AssessmentStatementRow[],
    ) {
        statementRowBuilders.forEach(builder => {
            builder.calcZ(kamokufukusuuSheet, statementRows);
            builder.calcX(kamokufukusuuSheet);
            builder.calcH();
            builder.calcG();
        });
    }
}
