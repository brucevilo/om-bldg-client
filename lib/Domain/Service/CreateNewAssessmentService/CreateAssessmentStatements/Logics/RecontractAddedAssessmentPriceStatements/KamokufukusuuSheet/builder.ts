import { floorOfPoint } from '@/App/utils/calculation';
import { Contract } from '@/Domain/Entity';
import { KamokufukusuuSheet } from '.';
import { AssessmentStatementRow } from '../StatementRow';

export class KamokufukusuuSheetBuilder {
    constructor(
        private kamokufukusuuSheet: KamokufukusuuSheet,
        private contract: Contract,
        private beforeContract: Contract,
    ) {}

    public calcH294H291(): void {
        if (this.beforeContract.contractedPriceWithoutTax == null)
            throw Error('前回の契約の契約価格が入力されていません');
        if (this.contract.contractedPriceWithoutTax == null)
            throw Error('現在の契約の契約価格が入力されていません');
        const val =
            this.contract.contractedPriceWithoutTax -
            this.beforeContract.contractedPriceWithoutTax;
        this.kamokufukusuuSheet.h294 = val;
        this.kamokufukusuuSheet.h291 =
            val + val * (this.contract.taxRate / 100);
    }

    public calcM294M291(): void {
        if (this.contract.expectedPrice == null)
            throw Error('前回の契約の契約価格が入力されていません');
        if (this.contract.contractedPriceWithoutTax == null)
            throw Error('現在の契約の契約価格が入力されていません');
        const val =
            this.contract.expectedPrice -
            this.beforeContract.contractedPriceWithoutTax;
        this.kamokufukusuuSheet.m294 = val;
        this.kamokufukusuuSheet.m291 =
            val + val * (this.contract.taxRate / 100);
    }

    public calcQ66(): void {
        if (this.kamokufukusuuSheet.h291 == null) throw Error('h291が空です');
        if (this.kamokufukusuuSheet.m291 == null) throw Error('m291が空です');
        const val = this.kamokufukusuuSheet.h291 / this.kamokufukusuuSheet.m291;
        const val2 = floorOfPoint(val, 4);
        this.kamokufukusuuSheet.q66 = val2;
    }

    public calcM298T66(): void {
        if (this.kamokufukusuuSheet.h294 == null) throw Error('h294が空です');
        if (this.kamokufukusuuSheet.m294 == null) throw Error('m294が空です');
        const val = this.kamokufukusuuSheet.m294 - this.kamokufukusuuSheet.h294;
        this.kamokufukusuuSheet.m298 = val;
        this.kamokufukusuuSheet.t66 = this.kamokufukusuuSheet.m298;
    }
    public calcS294(statementRows: AssessmentStatementRow[]): void {
        const val = statementRows.reduce((sum, statementRow) => {
            if (statementRow.r == null) {
                throw new Error('r列が未入力です');
            }
            if (statementRow.s == null) {
                throw new Error('s列が未入力です');
            }
            return sum + (statementRow.r === 0 ? statementRow.s : 0);
        }, 0);
        this.kamokufukusuuSheet.s294 = val;
    }

    public calcW297(): void {
        if (this.kamokufukusuuSheet.h294 == null) {
            throw new Error('h294が未入力です');
        }
        if (this.kamokufukusuuSheet.m294 == null) {
            throw new Error('m294が未入力です');
        }
        const val = this.kamokufukusuuSheet.h294 - this.kamokufukusuuSheet.m294;
        this.kamokufukusuuSheet.w297 = val;
    }

    public calcU297(): void {
        if (this.kamokufukusuuSheet.w297 == null) {
            throw new Error('w297が未入力です');
        }

        if (this.kamokufukusuuSheet.w297 >= 0) {
            const val = this.kamokufukusuuSheet.w297 / 1000;
            this.kamokufukusuuSheet.u297 = val;
        } else {
            const val = this.kamokufukusuuSheet.w297 / -1000;
            this.kamokufukusuuSheet.u297 = val;
        }
    }

    public calcU298(statementRows: AssessmentStatementRow[]): void {
        const val = statementRows.reduce((sum, statement) => {
            if (statement.y === null) {
                throw new Error('y列が入力されていません');
            }
            return sum + statement.y;
        }, 0);
        this.kamokufukusuuSheet.u298 = val;
    }

    public calcU299(): void {
        if (this.kamokufukusuuSheet.u297 === null) {
            throw new Error('u297が入力されていません');
        }
        if (this.kamokufukusuuSheet.u298 === null) {
            throw new Error('u298が入力されていません');
        }
        const val =
            this.kamokufukusuuSheet.u297 === this.kamokufukusuuSheet.u298
                ? 'S'
                : 'O';
        this.kamokufukusuuSheet.u299 = val;
    }
}
