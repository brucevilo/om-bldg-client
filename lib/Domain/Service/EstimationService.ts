import XLSX from 'xlsx';
import {
    ConstructionStatementSheetToEstimationItems,
    Estimate,
    ManageSheetService,
} from '@/App/Service';
import { assertsIsNotNull, Excel } from '@/Infrastructure';
import {
    AssetClass,
    AssetStatement,
    Classification,
    Construction,
    ConstructionStatement,
    Contract,
    CostItem,
    CostItemTag,
} from '../Entity';
import {
    AssetStatementForStore,
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementForStore,
    ConstructionStatementRepository,
    ContractRepository,
} from '../Repository';
import { CostDocument, EstimationItem } from '../ValueObject';
import { ExcelService } from './ExcelService';
import { AssetClassService } from './AssetClassService';
import { roundingInt } from '@/App/utils/calculation';

export type EstimationStatement = Pick<
    ConstructionStatement,
    'name' | 'term' | 'isCollateral'
> & {
    estimationItems: EstimationItem[];
};

export class EstimationService {
    public static async extractEstimationStatements(
        costDocumentArrayBuffer: ArrayBuffer,
        assetClasses: AssetClass[],
        construction: Construction,
        isDesignChange: boolean,
    ): Promise<EstimationStatement[]> {
        const workbook = XLSX.read(costDocumentArrayBuffer);

        const costDocument = new CostDocument(workbook);

        const constructionStatementSheetToEstimationItems =
            new ConstructionStatementSheetToEstimationItems(
                costDocument,
                assetClasses,
                construction,
                isDesignChange,
            );
        constructionStatementSheetToEstimationItems.setup();

        return costDocument.constructionSheets
            .map(sheet => ({
                sheet,
            }))
            .map(e => ({
                estimationItems:
                    constructionStatementSheetToEstimationItems.invoke(e.sheet),
                name: constructionStatementSheetToEstimationItems.constructionName(
                    e.sheet,
                ),
                isCollateral:
                    constructionStatementSheetToEstimationItems.isCollateralConstruction(
                        e.sheet,
                    ),
                term: constructionStatementSheetToEstimationItems.constructionTerm(
                    e.sheet,
                ),
            }))
            .map(e => ({
                ...e,
                term:
                    typeof e.term === 'number'
                        ? ExcelService.excelDateToJSDate(e.term as number)
                        : (e.term as Date),
            }));
    }

    public static estimationItemToCostItem(
        estimationItem: EstimationItem,
        assetClasses: AssetClass[],
    ): CostItem {
        return new CostItem(
            null,
            null,
            estimationItem.name,
            estimationItem.constructionType,
            estimationItem.priceCode,
            estimationItem.dimension,
            estimationItem.amount,
            estimationItem.unit,
            estimationItem.unitPrice,
            estimationItem.price,
            estimationItem.constructionTime,
            estimationItem.transportationTime,
            estimationItem.remarks,
            AssetClassService.resolveAssetClass(assetClasses, estimationItem) ||
                null,
            estimationItem.tags.map(
                t => new CostItemTag(null, null, t, new Date(), new Date()),
            ),
            [],
            '',
            [],
            null,
            estimationItem.price,
            estimationItem.amount,
            estimationItem.assetClassInfo,
            new Date(),
            new Date(),
        );
    }

    public static getExpectedPrice = (
        constructionStatements: ConstructionStatement[],
    ): number =>
        constructionStatements.reduce(
            (statementCostItemsTotalPrice, constructionStatement) => {
                const sumCostItemsPricePerConstructionStatement =
                    Math.floor(
                        constructionStatement.costItems.reduce(
                            (sum, costItem) => sum + costItem.price,
                            0,
                        ) / 1000,
                    ) * 1000;
                return (
                    statementCostItemsTotalPrice +
                    sumCostItemsPricePerConstructionStatement
                );
            },
            0,
        );

    public static createContractForDesignChange(
        costDocumentObject: CostDocument,
        construction: Construction,
        costDocument: File,
        manageSheet: File,
    ): Contract {
        const expectedPriceWithTax = costDocumentObject.totalPrice;
        const contractBeforeChange = construction.latestContract;
        const newContract = new Contract({
            constructionId: construction.id,
            expectedPriceWithTax,
            costDocument,
            manageSheet,
            contractNumber: contractBeforeChange.contractNumber,
            startAt: contractBeforeChange.startAt,
            supplierId: contractBeforeChange.supplierId,
            bidMethod: contractBeforeChange.bidMethod,
            designChiefId: contractBeforeChange.designChiefId,
            designStaffId: contractBeforeChange.designStaffId,
            constructionChiefId: contractBeforeChange.constructionChiefId,
            constructionStaffId: contractBeforeChange.constructionStaffId,
            nextAction: 'approval',
        });

        return newContract;
    }

    public static async onConstructionEstimate({
        constructionId,
        constructionStatements,
        assetStatements,
        assetClasses,
        costDocument,
        manageSheet,
        withinDesignChange, // 契約変更を積算と同時に行うか
    }: {
        constructionId: number;
        constructionStatements: ConstructionStatementForStore[];
        assetStatements: Array<AssetStatementForStore>;
        assetClasses: AssetClass[];
        costDocument: File;
        manageSheet: File;
        withinDesignChange: boolean;
    }): Promise<void> {
        assertsIsNotNull(constructionId);

        const costDocumentObject = new CostDocument(
            await Excel.read(costDocument),
        );

        if (withinDesignChange) {
            const contract = this.createContractForDesignChange(
                costDocumentObject,
                await ConstructionRepository.get(constructionId),
                costDocument,
                manageSheet,
            );

            await ContractRepository.create(contract);
        }

        // 工事明細を登録
        const storedConstructionStatements =
            await ConstructionStatementRepository.store(
                constructionStatements,
                constructionId,
                assetClasses,
            );

        // 資産を登録
        const newAssetStatements = assetStatements.map(as => {
            const getStoredConstructionStatementId = () => {
                const index = constructionStatements.indexOf(
                    as.constructionStatement,
                );

                const storedConstructionStatement =
                    storedConstructionStatements.find(
                        (cs, storedIndex) =>
                            storedIndex === index &&
                            cs.name === constructionStatements[index].name,
                    );

                assertsIsNotNull(
                    storedConstructionStatement?.id,
                    '対応する工事明細が見つかりません',
                );

                return storedConstructionStatement.id;
            };

            return new AssetStatement(
                null,
                getStoredConstructionStatementId(),
                as.assetClass,
                as.name,
                as.distributedPrice,
                '',
                null,
                null,
                false,
                null,
                as.constructionTypeSerialNumber,
                0,
                null,
                new Date(),
                new Date(),
                as.buildingsId,
            );
        });
        await AssetStatementRepository.store(
            constructionId,
            newAssetStatements,
        );

        // 予定価格の計算に必要となるため、工事を読み込み
        const construction = await ConstructionRepository.get(constructionId);

        // 内訳書と工事管理シートの登録、設計の場合明細の登録、予定価格の登録
        await new Estimate(
            construction,
            costDocument,
            manageSheet,
            this.getExpectedPrice(storedConstructionStatements),
        ).invoke();

        await ManageSheetService.updateForEstimated(constructionId);
    }

    // 費用計上金額を計算する
    public static getDistributedCost({
        classification,
        costItems,
        assetStatements,
    }: {
        classification?: Classification;
        costItems: CostItem[];
        assetStatements: Pick<AssetStatement, 'distributedPrice'>[];
    }): number {
        const totalPrice = ConstructionStatement.totalPrice(costItems);
        return classification === Classification.Cost
            ? totalPrice
            : totalPrice -
                  assetStatements.reduce(
                      (total, as) => total + as.distributedPrice,
                      0,
                  );
    }

    //  資産クラスに集約した資産の金額を計算する
    public static getDistributedAssetClassPrice(
        targetPrice: number,
        costItems: CostItem[],
    ): number {
        // 直接工事費
        const 直接工事費 = costItems
            .filter(ci => ci.isDirectExpence)
            .reduce((total, current) => total + current.price, 0);
        // 直接仮設工事費
        const 直接仮設工事費 = costItems
            .filter(ci => ci.constructionType === '直接仮設工事')
            .reduce((total, current) => total + current.price, 0);
        // 共通費
        const 共通費 = costItems
            .filter(ci => ci.isCommonExpence)
            .reduce((total, current) => total + current.price, 0);
        return roundingInt(
            targetPrice +
                (targetPrice / (直接工事費 - 直接仮設工事費)) * 直接仮設工事費 +
                (targetPrice / (直接工事費 - 直接仮設工事費)) * 共通費,
            3,
        );
    }
}
