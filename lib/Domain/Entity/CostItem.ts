import { Entity, Timestamps, AssetClass, CostItemTag, AssetChecklist } from '.';
import {
    AttachmentInfo,
    ConstructionType,
    ConstructionTypes,
} from '@/Domain/ValueObject';
import { cloneDeep } from 'lodash';

export enum CostItemRetirementStatus {
    NotYet = 'not_yet',
    PartOf = 'part_of',
    Done = 'done',
}

export class CostItem implements Entity, Timestamps {
    /**
     * 明細項目
     * @param name 明細項目名
     * @param constructionType 工種
     * @param code 単価コード
     * @param dimension 形状寸法
     * @param amount 数量
     * @param unit 単位
     * @param unitPrice 単価
     * @param price 金額
     * @param constructionTime 作業時間
     * @param transportationTime 運搬時間
     * @param remarks 摘要
     * @param assetClass 資産クラス名
     * @param costItemTags 特定情報
     */
    constructor(
        public id: number | null,
        public constructionStatementId: number | null,
        public name: string,
        public constructionType: ConstructionType,
        public code: number | null,
        public dimension: string,
        public amount: number,
        public unit: string,
        public unitPrice: number,
        public price: number,
        public constructionTime: string,
        public transportationTime: string,
        public remarks: string,
        public assetClass: AssetClass | null,
        public costItemTags: CostItemTag[],
        public assetChecklists: AssetChecklist[],
        public memo: string,
        public photosInfo: AttachmentInfo[],
        public mergedCostItemId: number | null,
        public estimatePrice: number | null,
        public estimateAmount: number | null,
        public assetClassInfo: string | null,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}

    public get isCapitalization(): boolean {
        return ConstructionTypes.isCapitalization(this.constructionType);
    }

    public get isCommonExpence(): boolean {
        return ConstructionTypes.isCommonExpence(this.constructionType);
    }

    public get isDirectExpence(): boolean {
        return ConstructionTypes.isDirectExpence(this.constructionType);
    }

    public setPriceCostItem(newPrice: number): CostItem {
        const _this = cloneDeep(this);
        _this.price = newPrice;
        return _this;
    }

    public isUnitPriceEqualPrice(): boolean {
        return ConstructionTypes.isUnitPriceIsPrice(this.constructionType);
    }
}
