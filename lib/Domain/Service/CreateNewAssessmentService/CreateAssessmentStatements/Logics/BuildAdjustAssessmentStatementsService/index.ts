import {
    Contract,
    AssetStatement,
    AssessmentStatement,
} from '../../../../../Entity';
import {
    excelRoundingPoint,
    roundingInt,
} from '../../../../../../App/utils/calculation';
import { AdjustHasuuNumber } from './AdjustHasuuNumber';

// 査定表の行を計算するためのオブジェクト
export type AdjustAssessmentStatement = {
    // ---設計時のみ表紙の行と再度紐付けるために使う
    name?: string;
    part?: string;
    // ------------------------------------
    // ---工事のみ明細と紐づけるために使う--------
    constructionStatementId?: number;
    // ------------------------------------
    distributedPrice: number;
    beforeCorrectPrice?: number;
    rate?: number;
    plusRank?: number;
    minusRank?: number;
    plusCorrectPrice?: number;
    minusCorrectPrice?: number;
    correctPrice?: number;
    correctedPrice?: number;
};

type AdjustStatementWithOrder = {
    statement: AdjustAssessmentStatement;
    index: number;
};

export class BuildAdjustAssessmentStatementsService {
    constructor(
        private contract: Contract,
        private statementsWithContractableType:
            | {
                  contractableTypeIsConstruction: true;
                  statements: AssetStatement[];
              }
            | {
                  contractableTypeIsConstruction: false;
                  statements: AssessmentStatement[];
              },
    ) {}
    // 査定表シートの入力表と同じロジックで金額調整
    invoke(): AdjustAssessmentStatement[] {
        const adjustAssessmentStatements =
            this.createAdjustAssessmentStatementsFromEachHasuuNum();

        return adjustAssessmentStatements;
    }

    private createAdjustAssessmentStatementsFromEachHasuuNum(): AdjustAssessmentStatement[] {
        let adjustAssessmentStatements: AdjustAssessmentStatement[] = [];
        const adjustHasuuNumber = new AdjustHasuuNumber();
        while (true) {
            const hasuuNum = adjustHasuuNumber.nextAdjustHasuuNumber();
            const _adjustAssessmentStatements =
                this.createAdjustAssessmentStatements(hasuuNum);

            const totalCorrectedPrice = _adjustAssessmentStatements.reduce(
                (sum, statement) => sum + (statement.correctedPrice || 0),
                0,
            );
            if (
                totalCorrectedPrice === this.contract.contractedPriceWithoutTax
            ) {
                adjustAssessmentStatements = _adjustAssessmentStatements;
                break;
            }
            if (!adjustHasuuNumber.isFinalAdjustHasuuNumber) {
                continue;
            }
            throw new Error(
                '査定表の端数調整3,4で計算したときに金額が一致しません。',
            );
        }
        return adjustAssessmentStatements;
    }

    private createAdjustAssessmentStatements(hasuuNum: number) {
        const _adjustAssessmentStatements: AdjustAssessmentStatement[] = this
            .statementsWithContractableType.contractableTypeIsConstruction
            ? this.statementsWithContractableType.statements.map(as => ({
                  name: as.name,
                  distributedPrice: as.distributedPrice,
                  beforeCorrectPrice: roundingInt(
                      as.distributedPrice * this.contract.rateDown4,
                      hasuuNum,
                  ),
                  constructionStatementId: as.constructionStatementId,
              }))
            : this.statementsWithContractableType.statements.map(as => ({
                  name: as.name,
                  part: as.part,
                  distributedPrice: as.costDocumentPrice,
                  beforeCorrectPrice: roundingInt(
                      as.costDocumentPrice * this.contract.rateDown4,
                      hasuuNum,
                  ),
              }));
        const totalCorrectPrice = this.culcTotalCorrectPrice(
            _adjustAssessmentStatements,
        );
        // priceが0の明細を省いた上で、金額を計算した後、元の順番に戻すため
        const adjustAssessmentStatementsWithOrder: AdjustStatementWithOrder[] =
            _adjustAssessmentStatements.map((statement, idx) => ({
                statement,
                index: idx,
            }));
        const adjustedAssessmentStatements = this.addCorrectedPrice(
            this.addRank(
                this.addRate(
                    adjustAssessmentStatementsWithOrder.filter(
                        asO => asO.statement.distributedPrice !== 0,
                    ),
                ),
            ),
            totalCorrectPrice,
            hasuuNum,
        );
        const resultAdjustAssessmentStatements = [
            ...adjustedAssessmentStatements,
            ...adjustAssessmentStatementsWithOrder.filter(
                asO => asO.statement.distributedPrice === 0,
            ),
        ];
        return resultAdjustAssessmentStatements
            .sort((a, b) => a.index - b.index)
            .map(statementWith => statementWith.statement);
    }

    private addRate(
        adjustAssessmentStatementsWithOrder: AdjustStatementWithOrder[],
    ): AdjustStatementWithOrder[] {
        return adjustAssessmentStatementsWithOrder.map(asO => ({
            ...asO,
            statement: {
                ...asO.statement,
                rate: excelRoundingPoint(
                    (asO.statement.beforeCorrectPrice || 0) /
                        asO.statement.distributedPrice,
                ),
            },
        }));
    }
    private culcTotalCorrectPrice(
        adjustAssessmentStatements: AdjustAssessmentStatement[],
    ) {
        const totalBeforeCorrectPriceWithoutTax =
            adjustAssessmentStatements.reduce(
                (total, as) => total + (as.beforeCorrectPrice || 0),
                0,
            );
        // 処理自体は税抜き契約価格 - 補正前金額の税抜きの合計だが、0.00000001の差で数値が大きく変わるので、
        // 厳密にエクセルでの処理に合わせる
        return excelRoundingPoint(
            excelRoundingPoint(
                (this.contract.contractedPrice || 0) /
                    (1 + this.contract.taxRate / 100),
            ) -
                excelRoundingPoint(
                    (totalBeforeCorrectPriceWithoutTax +
                        excelRoundingPoint(
                            (totalBeforeCorrectPriceWithoutTax *
                                this.contract.taxRate) /
                                100,
                        )) /
                        (1 + this.contract.taxRate / 100),
                ),
        );
    }
    private addRank(
        adjustAssessmentStatementsWithOrder: AdjustStatementWithOrder[],
    ): AdjustStatementWithOrder[] {
        let beforePlusRank: number;
        const addedPlusRank = adjustAssessmentStatementsWithOrder
            .sort((a, b) => (a.statement.rate || 0) - (b.statement.rate || 0))
            .map((as, idx, arr) => {
                const beforeStatement = arr[idx - 1];
                const currentRank =
                    beforeStatement?.statement.rate === as.statement.rate
                        ? beforePlusRank
                        : idx + 1;
                beforePlusRank = currentRank;
                return {
                    ...as,
                    statement: { ...as.statement, plusRank: currentRank },
                };
            });

        let beforeMinusRank: number;
        const addedMinusRank = addedPlusRank
            .sort((a, b) => (b.statement.rate || 0) - (a.statement.rate || 0))
            .map((as, idx, arr) => {
                const beforeStatement = arr[idx - 1];
                const currentRank =
                    beforeStatement?.statement.rate === as.statement.rate
                        ? beforeMinusRank
                        : idx + 1;
                beforeMinusRank = currentRank;
                return {
                    ...as,
                    statement: { ...as.statement, minusRank: currentRank },
                };
            });
        return addedMinusRank;
    }
    private addCorrectedPrice(
        adjustAssessmentStatements: AdjustStatementWithOrder[],
        totalCorrectPrice: number,
        hasuuNum: number,
    ): AdjustStatementWithOrder[] {
        return adjustAssessmentStatements
            .map(asO => {
                return {
                    ...asO,
                    statement: {
                        ...asO.statement,
                        plusCorrectPrice:
                            totalCorrectPrice > 0
                                ? totalCorrectPrice >=
                                  (asO.statement.plusRank || 0) * 10 ** hasuuNum
                                    ? 10 ** hasuuNum
                                    : 0
                                : 0,
                        minusCorrectPrice:
                            totalCorrectPrice < 0
                                ? totalCorrectPrice >=
                                  (asO.statement.minusRank || 0) *
                                      10 ** hasuuNum
                                    ? -(10 ** hasuuNum)
                                    : 0
                                : 0,
                    },
                };
            })
            .map(asO => ({
                ...asO,
                statement: {
                    ...asO.statement,
                    correctPrice:
                        (asO.statement.plusCorrectPrice || 0) +
                        (asO.statement.minusCorrectPrice || 0),
                },
            }))
            .map(asO => ({
                ...asO,
                statement: {
                    ...asO.statement,
                    correctedPrice:
                        (asO.statement.correctPrice || 0) +
                        (asO.statement.beforeCorrectPrice || 0),
                },
            }));
    }
}
