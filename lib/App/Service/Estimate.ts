import { Construction, Contract, Design } from '@/Domain/Entity';
import { assertsIsExists, Excel } from '@/Infrastructure';
import { ContractRepository } from '@/Domain/Repository';
import { CostDocument } from '@/Domain/ValueObject';
import { CreateNewAssessmentService } from '@/Domain/Service';
import { ManageSheetService } from './ManageSheet';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { checkDepartmentNameExistence } from './Validaty/CostDocumentToEstimationSheet';

export class Estimate {
    private costDocument: CostDocument | null = null;
    /**
     * @param contractable
     * @param specFile 設計書
     * @param costDocumentFile 工事費内訳書
     */
    constructor(
        private contractable: Construction | Design,
        private costDocumentFile: File,
        private manageSheet: File,
        private expectedPriceWithoutTaxFromConstruction?: number,
    ) {}

    async invoke(): Promise<Contract> {
        const costDocumentWorkBook = await Excel.read(this.costDocumentFile);
        this.costDocument = new CostDocument(costDocumentWorkBook);
        checkDepartmentNameExistence(
            this.costDocument.coverSheet,
            this.costDocument,
        );
        const expectedPriceWithTax = this.costDocument.totalPrice;
        const bidMethod: string = this.costDocument.cell('I8') || '';
        const endAt: string | Date = new Date(
            this.costDocument.cell('K6') || '',
        );

        let expectedPriceForDesign;
        if (this.contractable.latestContract.designId) {
            const assessment = await new CreateNewAssessmentService(
                this.contractable,
                this.contractable.latestContract,
                this.costDocument,
            ).invoke();
            expectedPriceForDesign = assessment.statements.reduce(
                (sum, statement) => sum + statement.costDocumentPrice,
                0,
            );
            assertsIsExists(this.contractable.id, 'DesignにIDがありません');

            await AssessmentStatementRepository.store(
                assessment.statements,
                this.contractable.latestContract.id,
            );
        }
        if (this.contractable.latestContract.designId) {
            await ManageSheetService.updateForDesignEstimated(
                this.contractable.latestContract.designId,
            );
        } else {
            if (!this.expectedPriceWithoutTaxFromConstruction) {
            }
        }
        if (
            this.contractable.latestContract.constructionId &&
            !this.expectedPriceWithoutTaxFromConstruction
        ) {
            throw new Error('税抜き予定価格を渡してください');
        }

        const expectedPriceObj = expectedPriceForDesign
            ? { expectedPrice: expectedPriceForDesign }
            : this.expectedPriceWithoutTaxFromConstruction
            ? { expectedPrice: this.expectedPriceWithoutTaxFromConstruction }
            : {};
        const contract = await ContractRepository.updateEstimation({
            id: this.contractable.latestContract.id,
            expectedPriceWithTax,
            costDocument: this.costDocumentFile,
            manageSheet: this.manageSheet,
            bidMethod: bidMethod,
            endAt: endAt,
            ...expectedPriceObj,
        });

        return contract;
    }
}
