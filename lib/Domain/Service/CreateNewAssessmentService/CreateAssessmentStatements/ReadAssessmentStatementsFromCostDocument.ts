import { AssessmentStatement, Contract, Contractable } from '@/Domain/Entity';
import { CostDocument } from '@/Domain/ValueObject';

export class ReadAssessmentStatementsFromCostDocument {
    constructor(
        private costDocument: CostDocument,
        private contract: Contract,
        private contractable: Contractable,
    ) {}

    public invoke(): AssessmentStatement[] {
        if (this.contract.designId) {
            return this.readAssessmentStatementsFromDesignCostdocument();
        } else {
            return this.readAssessmentStatementsFromConstructionCostdocument();
        }
    }

    private readAssessmentStatementsFromDesignCostdocument() {
        const eofRowIndex = this.costDocument.eofRowIndex;
        // 明細が始まる行から探索スタート
        let rowIndex = this.costDocument.firstRowIndex;
        const assessmentStatementWithoutPrices: AssessmentStatement[] = [];
        // L列(変更後明細はO列)の値が「費目」であればその値をpartとして、小計行の上の行までを行ごとにAssessmentStatementとする
        let part = '';
        while (true) {
            if (rowIndex > eofRowIndex - 2) {
                break;
            }
            const name = this.cell<string | null>(`D${rowIndex}`);
            const key = `${this.costDocument.keyLine}${rowIndex}`;
            // 名称はあってL列(変更後明細はO列)の値が「費目」である行
            if (name && this.costDocument.isPartRow(key)) {
                part = name;
            } else if (
                // 明細の行(L列(変更後明細はO列)の値が「業務○」)をAssessmentStatementに変換
                this.costDocument.isDesignStatementRow(key)
            ) {
                assessmentStatementWithoutPrices.push(
                    this.buildAssessmentStatementWithoutPrice(part, rowIndex),
                );
            }
            rowIndex++;
        }
        return assessmentStatementWithoutPrices;
    }

    private readAssessmentStatementsFromConstructionCostdocument() {
        const keyLine = this.contractable.isContractChanged ? 'O' : 'L';
        const assessmentStatementWithoutPrices: AssessmentStatement[] = [];
        let part = '';
        for (
            let rowIndex = this.costDocument.firstRowIndex;
            rowIndex < this.costDocument.eofRowIndex;
            rowIndex++
        ) {
            const nameOrPart = this.cell<string>(`D${rowIndex}`);
            const key = `${keyLine}${rowIndex}`;
            if (nameOrPart && this.costDocument.isPartRow(key)) {
                part = nameOrPart;
            } else if (
                part &&
                this.costDocument.isConstructionStatementRow(key)
            ) {
                assessmentStatementWithoutPrices.push(
                    this.buildAssessmentStatementWithoutPrice(part, rowIndex),
                );
            }
        }
        return assessmentStatementWithoutPrices;
    }

    cell<T>(key: string): T | null {
        return this.costDocument.cell<T>(key);
    }

    get nameCol(): string {
        return 'D';
    }

    get divisionCol(): string {
        return 'E';
    }

    get unitCol(): string {
        return this.costDocument.isFirstContract ? 'G' : 'H';
    }

    // 初回設計は金額列
    // 契約変更は今回工事費
    get priceCol(): string {
        return this.costDocument.isFirstContract ? 'I' : 'K';
    }

    getConstructionRowAmount(rowIndex: number): number | null {
        if (this.costDocument.isFirstContract)
            return this.cell<number>(`F${rowIndex}`);
        return (
            this.cell<number>(`F${rowIndex}`) ||
            this.cell<number>(`G${rowIndex}`)
        );
    }

    /**
     * 指定された行番号と部の名称からAssessmentStatementを作成
     * priceは諸々全体を見て計算する必要があるのでここでは埋めない
     */
    buildAssessmentStatementWithoutPrice(
        part: string,
        rowIndex: number,
    ): AssessmentStatement {
        const name = this.cell<string>(`${this.nameCol}${rowIndex}`);
        const division = this.cell<string>(`${this.divisionCol}${rowIndex}`);
        const amount = this.getConstructionRowAmount(rowIndex);
        const unit = this.cell<string>(`${this.unitCol}${rowIndex}`);
        const price = this.cell<number>(`${this.priceCol}${rowIndex}`);
        if (
            !name ||
            (this.costDocument.isFirstContract && !amount) ||
            (this.costDocument.isFirstContract && !unit) ||
            price === null
        ) {
            throw new Error(`${rowIndex}行目に入力されていないセルがあります`);
        }
        return new AssessmentStatement(
            null,
            part,
            name,
            division || '',
            amount || 0,
            unit || '',
            price,
            null,
            true,
        );
    }
}
