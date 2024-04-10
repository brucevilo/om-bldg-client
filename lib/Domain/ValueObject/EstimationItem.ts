import { cloneDeep } from 'lodash';
import { ConstructionType, ConstructionTypes } from '.';

/**
 * 積算登録用エクセルの行
 * CostItemからidやassetClassを抜いて資産クラス特定情報を入れたもの
 */
export class EstimationItem {
    public constructionName: string;
    public constructionTerm: Date | null;
    public name: string;
    public constructionType: ConstructionType;
    public priceCode: number | null;
    public dimension: string;
    public amount: number;
    public unit: string;
    public unitPrice: number;
    public price: number;
    public constructionTime: string;
    public transportationTime: string;
    public remarks: string;
    public assetClassInfo: string;
    public tags: string[];

    constructor(params: {
        constructionName: string;
        constructionTerm: Date | null;
        name: string;
        constructionType: ConstructionType;
        priceCode?: number | null;
        dimension?: string;
        amount: number;
        unit: string;
        unitPrice: number;
        price: number;
        constructionTime?: string;
        transportationTime?: string;
        remarks?: string;
        assetClassInfo: string;
        tags?: string[];
    }) {
        this.constructionName = params.constructionName;
        this.constructionTerm = params.constructionTerm || null;
        this.name = params.name;
        this.constructionType = params.constructionType;
        this.priceCode = params.priceCode || null;
        this.dimension = params.dimension || '';
        this.amount = params.amount;
        this.unit = params.unit;
        this.unitPrice = params.unitPrice;
        this.price = params.price;
        this.constructionTime = params.constructionTime || '';
        this.transportationTime = params.transportationTime || '';
        this.remarks = params.remarks || '';
        this.assetClassInfo = params.assetClassInfo;
        this.tags = params.tags || [];
    }

    public isUnitPriceEqualPrice(): boolean {
        return ConstructionTypes.isUnitPriceIsPrice(this.constructionType);
    }

    public setPriceEstimationItem(newPrice: number): EstimationItem {
        const _this = cloneDeep(this);
        _this.price = newPrice;
        return _this;
    }
}
