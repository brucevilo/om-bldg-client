import { roundingInt } from '@/App/utils/calculation';
import { assertsIsNotNull } from '@/Infrastructure';
import { AssessmentStatementRow } from '..';
import { KamokufukusuuSheet } from '../../KamokufukusuuSheet';

export class StatementRowBuilder {
    constructor(private statementRow: AssessmentStatementRow) {}

    public calcO(kamokufukusuuSheet: KamokufukusuuSheet): void {
        assertsIsNotNull(kamokufukusuuSheet.q66, 'q66が入力されていません');
        const val = this.statementRow.m * kamokufukusuuSheet.q66;
        this.statementRow.o = val;
    }

    public calcP(): void {
        assertsIsNotNull(this.statementRow.o, 'o列が入力されていません');
        const val = roundingInt(this.statementRow.o, 3);
        this.statementRow.p = val;
    }

    public calcQ(): void {
        assertsIsNotNull(this.statementRow.o, 'o列が入力されていません');
        const val = roundingInt(this.statementRow.o, 4);
        this.statementRow.q = val;
    }

    public calcR(kamokufukusuuSheet: KamokufukusuuSheet): void {
        assertsIsNotNull(kamokufukusuuSheet.q66, 'q66が入力されていません');
        assertsIsNotNull(kamokufukusuuSheet.q66);
        assertsIsNotNull(this.statementRow.o);

        if (kamokufukusuuSheet.q66 < 1 && this.statementRow.o >= 0) {
            this.statementRow.r = 0;
            return;
        }
        if (kamokufukusuuSheet.q66 >= 1 && this.statementRow.o < 0) {
            this.statementRow.r = 0;
            return;
        }
        this.statementRow.r = 1;
    }

    public calcT(kamokufukusuuSheet: KamokufukusuuSheet): void {
        assertsIsNotNull(this.statementRow.r), 'r列が入力されていません';
        assertsIsNotNull(kamokufukusuuSheet.s294, 's294が入力されていません');
        if (this.statementRow.r === 0) {
            const val = this.statementRow.s / kamokufukusuuSheet.s294;
            this.statementRow.t = val;
            return;
        } else {
            this.statementRow.t = 0;
        }
    }

    public calcV(kamokufukusuuSheet: KamokufukusuuSheet): void {
        assertsIsNotNull(kamokufukusuuSheet.t66, 't66が入力されていません');
        assertsIsNotNull(this.statementRow.s, 's列が入力されていません');
        assertsIsNotNull(this.statementRow.t, 't列が入力されていません');
        const val = Math.floor(
            this.statementRow.s - kamokufukusuuSheet.t66 * this.statementRow.t,
        );
        this.statementRow.v = val;
    }

    // digitはW列を全て合計した時に差引き金額(今回契約価格 - 前回契約価格)と一致する桁数に合わせる
    // 1桁から順に一致するかを確認していく
    // 一致する桁数がない時はDirectorでエラーを出す
    public calcW(digit: number): void {
        assertsIsNotNull(this.statementRow.v, 'v列が入力されていません');
        const val = roundingInt(this.statementRow.v, digit);
        this.statementRow.w = val;
    }

    public calcU(
        // T列大きい順にランクをつける
        statementsWithRank: {
            statement: AssessmentStatementRow;
            rank: number;
        }[],
    ): void {
        const target = statementsWithRank.find(
            statementWithRank =>
                statementWithRank.statement.name === this.statementRow.name &&
                statementWithRank.statement.part === this.statementRow.part,
        );
        if (!target) {
            throw new Error('対象の明細(ランク付き)がありません');
        }
        this.statementRow.u = target.rank;
    }

    public calcY(kamokufukusuuSheet: KamokufukusuuSheet): void {
        assertsIsNotNull(kamokufukusuuSheet.u297, 'u297が入力されていません');
        assertsIsNotNull(this.statementRow.u, 'u列が入力されていません');
        const val = this.statementRow.u <= kamokufukusuuSheet.u297 ? 1 : 0;
        this.statementRow.y = val;
    }

    public calcZ(
        kamokufukusuuSheet: KamokufukusuuSheet,
        statementRows: AssessmentStatementRow[], //順番は明細の並び順
    ): void {
        assertsIsNotNull(kamokufukusuuSheet.u299, 'u299が入力されていません');
        assertsIsNotNull(this.statementRow.y, 'y列が入力されていません');
        assertsIsNotNull(kamokufukusuuSheet.u297, 'u297が入力されていません');
        if (this.statementRow.y === 0 || kamokufukusuuSheet.u299 === 'S') {
            this.statementRow.z = 0;
            return;
        }
        let countPreZ = 0;
        for (let i = 0; i < statementRows.length; i++) {
            const statementRow = statementRows[i];
            assertsIsNotNull(statementRow.y);
            if (
                statementRow.name === this.statementRow.name &&
                statementRow.part === this.statementRow.part
            ) {
                break;
            }
            countPreZ = countPreZ + statementRow.y;
        }
        const val = countPreZ >= kamokufukusuuSheet.u297 ? 0 : 1;
        this.statementRow.z = val;
    }

    public calcX(kamokufukusuuSheet: KamokufukusuuSheet): void {
        assertsIsNotNull(kamokufukusuuSheet.u299, 'u299が入力されていません');
        assertsIsNotNull(kamokufukusuuSheet.w297, 'w297が入力されていません');
        assertsIsNotNull(kamokufukusuuSheet.u297, 'u297が入力されていません');
        assertsIsNotNull(this.statementRow.y, 'y列が入力されていません');
        assertsIsNotNull(this.statementRow.z, 'z列が入力されていません');
        assertsIsNotNull(this.statementRow.w, 'w列が入力されていません');

        if (kamokufukusuuSheet.u299 === 'S' && this.statementRow.y === 1) {
            const val =
                this.statementRow.w +
                kamokufukusuuSheet.w297 / kamokufukusuuSheet.u297;
            this.statementRow.x = val;
            return;
        }
        if (
            kamokufukusuuSheet.u299 === 'O' &&
            this.statementRow.y === 1 &&
            this.statementRow.z === 1
        ) {
            const val =
                this.statementRow.w +
                kamokufukusuuSheet.w297 / kamokufukusuuSheet.u297;
            this.statementRow.x = val;
            return;
        }
        this.statementRow.x = this.statementRow.w;
    }

    public calcH(): void {
        assertsIsNotNull(this.statementRow.x, 'x列が入力されていません');

        this.statementRow.h = this.statementRow.x;
    }

    public calcG(): void {
        assertsIsNotNull(this.statementRow.f, 'f列が入力されていません');
        assertsIsNotNull(this.statementRow.h, 'h列が入力されていません');

        const val = this.statementRow.f + this.statementRow.h;
        this.statementRow.g = val;
    }
}
