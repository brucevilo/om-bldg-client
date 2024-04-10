import {
    fullWidthRightCircleBracketsToHalfSize,
    stringAdaptFormats,
} from '@/App/utils/stringAdaptformats';
import {
    AssessmentStatement,
    AssetStatement,
    ConstructionStatement,
    Contract,
    Contractable,
    PreviousConstructionStatement,
} from '@/Domain/Entity';
import { ConstructionStatementRepository } from '@/Domain/Repository';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { CostDocument } from '@/Domain/ValueObject';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { ReadAssessmentStatementsFromCostDocument } from './ReadAssessmentStatementsFromCostDocument';

export class CreateConstructionAssessmentStatements {
    constructor(
        private contract: Contract,
        private costDocument: CostDocument,
        private assetStatementAddedAssessmentPrice: AssetStatement[],
        private contractable: Contractable,
        private beforeAssessmentStatements?: AssessmentStatement[],
    ) {}
    public async invoke(): Promise<AssessmentStatement[]> {
        const currentStatements =
            await this.createAddedPriceAssessmentStatements();
        const lostStatements = await this.createLostAssessmentStatements();
        return currentStatements.concat(lostStatements);
    }

    private checkAssessmentStatementIsConstructionStatementSame(
        assessmentStatement: AssessmentStatement,
        constructionStatement:
            | ConstructionStatement
            | PreviousConstructionStatement,
    ) {
        const asPart = stringAdaptFormats(
            assessmentStatement.part,
            fullWidthRightCircleBracketsToHalfSize,
        );
        const csPart = stringAdaptFormats(
            constructionStatement.assessmentPart,
            fullWidthRightCircleBracketsToHalfSize,
        );
        return (
            constructionStatement.assessmentName === assessmentStatement.name &&
            asPart.includes(csPart)
        );
    }

    private async createConstructionAssessmentStatementsWithoutPrice(): Promise<
        AssessmentStatement[]
    > {
        assertsIsNotNull(this.contract.constructionId);

        // 工事内訳書の表紙からは今回変更があった工事明細しか読みとれないので
        // 今回変更のあった明細 -> ①
        // 前回の明細の中から今回の明細に存在してかつ、今回変更のなかった明細 -> ②
        // ① + ②が今回査定表に表示する明細の全て

        // ①
        const assessmentStatementsWithoutPriceFromCostDocument =
            new ReadAssessmentStatementsFromCostDocument(
                this.costDocument,
                this.contract,
                this.contractable,
            ).invoke();
        if (!this.contractable.isContractChanged) {
            return assessmentStatementsWithoutPriceFromCostDocument;
        }

        // ②
        const beforeContract = this.contractable.prevContract;
        assertsIsNotNull(beforeContract, '前回契約がありません');
        const previousAssessmentStatements =
            await AssessmentStatementRepository.findByContract(
                beforeContract.id,
            );
        const currentConstructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                this.contract.constructionId,
                this.contract.id,
            );
        // 前回からあった査定表明細のうち、②の対象のものに絞る
        const filteringWithoutCurrentChangedAssessmentStatements = (() => {
            // 今回の明細の中から今回変更のあったものを消す
            const filteringWithoutCurrentChangeConstructionStatements =
                currentConstructionStatements.filter(cs => {
                    return assessmentStatementsWithoutPriceFromCostDocument.every(
                        assessmentStatement =>
                            assessmentStatement.part !== cs.assessmentPart ||
                            assessmentStatement.name !== cs.assessmentName,
                    );
                });
            // ②の対象の査定表明細のみにする
            // 今回の査定表明細の対象だが、今回変更で変更のなかった査定表明細
            // 内訳書金額とpartとnameを新しく、他を初期状態にしておく
            const filteringCurrentNotChangedAssessmentStatements =
                previousAssessmentStatements.flatMap(assessmentStatement => {
                    const targetConstructionStatement =
                        filteringWithoutCurrentChangeConstructionStatements.find(
                            cs => {
                                if (!cs.previousConstructionStatement)
                                    return false;
                                return (
                                    cs.previousConstructionStatement
                                        .assessmentPart ===
                                        assessmentStatement.part &&
                                    cs.previousConstructionStatement
                                        .assessmentName ===
                                        assessmentStatement.name
                                );
                            },
                        );
                    if (!targetConstructionStatement) return [];

                    // partと名前は変わる可能性がないらしいが、変更したときのために今回の明細のものを入れ直す
                    // 内訳書の明細金額は工事明細の金額を入れておけばいいはず
                    return new AssessmentStatement(
                        null,
                        targetConstructionStatement.assessmentPart,
                        targetConstructionStatement.assessmentName,
                        assessmentStatement.size,
                        assessmentStatement.amount,
                        assessmentStatement.unit,
                        targetConstructionStatement.totalPrice,
                        null,
                        true,
                        assessmentStatement.constructionTypeSerialNumber,
                    );
                });
            return filteringCurrentNotChangedAssessmentStatements;
        })();
        return assessmentStatementsWithoutPriceFromCostDocument.concat(
            filteringWithoutCurrentChangedAssessmentStatements,
        );
    }

    private async createAddedPriceAssessmentStatements(): Promise<
        AssessmentStatement[]
    > {
        const assessmentStatementsWithoutPrice =
            await this.createConstructionAssessmentStatementsWithoutPrice();
        assertsIsNotNull(this.contract.constructionId);
        const constructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                this.contract.constructionId,
                this.contract.id,
            );

        return assessmentStatementsWithoutPrice.map(as => {
            const targetConstructionStatement = constructionStatements.find(
                cs => {
                    return (
                        this.checkAssessmentStatementIsConstructionStatementSame(
                            as,
                            cs,
                        ) ||
                        (cs.previousConstructionStatement &&
                            this.checkAssessmentStatementIsConstructionStatementSame(
                                as,
                                cs.previousConstructionStatement,
                            ))
                    );
                },
            );

            assertsIsExists(
                targetConstructionStatement,
                '対象のConstructionStatementがありません',
            );
            const targetAssetStatements =
                this.assetStatementAddedAssessmentPrice.filter(
                    asset =>
                        asset.constructionStatementId ===
                        targetConstructionStatement.id,
                );

            const assessmentStatementPrice = targetAssetStatements.reduce(
                (total, asset) => {
                    assertsIsExists(
                        asset.assessmentPrice,
                        '調整後の金額がありません',
                    );
                    return total + asset.assessmentPrice;
                },
                0,
            );
            assertsIsNotNull(targetConstructionStatement.id);
            return {
                ...as,
                price: assessmentStatementPrice,
                constructionStatementId: targetConstructionStatement.id,
            };
        });
    }

    // @TODO 該当の内訳書が今のところないのでわからないが変更明細書に前の明細書から消えた明細が金額０で記載されている可能性があるのでこのメソッドが入らなくなる可能性がある
    // 今回の工事明細が持つ前回工事明細全てに一致しない査定表明細をフィルタリング = 前回から今回で消えた査定表明細を取得
    private async createLostAssessmentStatements() {
        if (!this.beforeAssessmentStatements) return [];
        assertsIsNotNull(this.contract.constructionId);
        const currentConstructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                this.contract.constructionId,
                this.contract.id,
            );
        const previousConstructionStatements =
            currentConstructionStatements.flatMap(cs => {
                if (!cs.previousConstructionStatement) return [];

                return [cs.previousConstructionStatement];
            });

        return this.beforeAssessmentStatements
            .filter(beforeAssessmentStatement => {
                if (beforeAssessmentStatement.price === 0) return false;
                return previousConstructionStatements.every(
                    previousConstructionStatement =>
                        !this.checkAssessmentStatementIsConstructionStatementSame(
                            beforeAssessmentStatement,
                            previousConstructionStatement,
                        ),
                );
            })
            .map(before => ({ ...before, costDocumentPrice: 0, price: 0 }));
    }
}
