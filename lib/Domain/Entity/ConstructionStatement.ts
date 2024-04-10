import { assertsIsExists } from '@/Infrastructure';
import {
    Entity,
    Timestamps,
    CostItem,
    AssetClass,
    PreviousConstructionStatement,
    ConstructionStatementHistory,
    Contract,
} from '.';
import { ConstructionType } from '../ValueObject';
import { Retirement } from './Retirement';

export enum Classification {
    Asset = 'asset',
    Cost = 'cost',
}

export class ConstructionStatement implements Entity, Timestamps {
    /**
     * 工事明細
     * @param name 工事明細名
     * @param term 工事工期
     * @param classification 資産または費用
     * @param isRetiremented 除却済み
     * @param isConstructionInProgressCompleted 建仮精算済み
    /** */
    constructor(
        public id: number | null,
        public contractId: number,
        public name: string,
        public projectCode: string,
        public term: Date,
        public costItems: CostItem[],
        public classification: Classification,
        public isRetiremented: boolean,
        public isConstructionInProgressCompleted: boolean,
        public retirement: Retirement | null,
        public scheduledAcceptanceDate: Date | null,
        public isCollateral: boolean,
        public previousConstructionStatementId: number | null,
        public previousConstructionStatement: PreviousConstructionStatement | null,
        public contract: Contract | null,
        public constructionStatementHistories:
            | ConstructionStatementHistory[]
            | [],
        public createdAt: Date,
        public updatedAt: Date,
    ) {
        const _ = this.name.split(/-/);
        assertsIsExists(
            _[0],
            'ConstructionStatement名がpart名-工事名称ではありません',
        );
        assertsIsExists(
            _[1],
            'ConstructionStatement名がpart名-工事名称ではありません',
        );
        this.assessmentPart = _[0];
        this.assessmentName = _.splice(1).join('-');
    }
    public assessmentPart: string;
    public assessmentName: string;

    public get isAssetClassification(): boolean {
        return this.classification === Classification.Asset;
    }

    public static totalPrice(costItems: CostItem[]): number {
        return costItems.map(ci => ci.price).reduce((a, b) => a + b, 0);
    }

    public get totalPrice(): number {
        return ConstructionStatement.totalPrice(this.costItems);
    }

    // 特定のAssetClassに紐づくCostItemの合計金額を集計
    public aggregateCostItemsWithSpecificAssetClass(
        assetClass: AssetClass,
    ): number {
        return this.costItems
            .filter(ci => ci.assetClass?.id === assetClass.id)
            .reduce((total, current) => total + current.price, 0);
    }

    // 特定の工種に紐づくCostItemの合計金額を集計
    public static aggregateCostItemsWithSpecificConstructionType(
        costItems: CostItem[],
        constructionType: ConstructionType,
    ): number {
        return costItems
            .filter(ci => ci.constructionType === constructionType)
            .reduce((total, current) => total + current.price, 0);
    }

    public aggregateCostItemsWithSpecificConstructionType(
        constructionType: ConstructionType,
    ): number {
        return ConstructionStatement.aggregateCostItemsWithSpecificConstructionType(
            this.costItems,
            constructionType,
        );
    }

    public latestHistory(): ConstructionStatementHistory | null {
        if (this.constructionStatementHistories?.length === 0) return null;
        return [...this.constructionStatementHistories].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[0];
    }
}
