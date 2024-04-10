import { CostItemMaster } from '../CostDocument';
import { convertToAscii } from '../utils';

export class CostItem {
    public constructor(
        private _id: string,
        private _constructionType: string,
        private _constructionTime: string,
        private _transportationTime: string,
        private _code: number | null,
        private _name: string,
        private _dimension: string,
        private _amount: number,
        private _unit: string,
        private _unitPrice: number,
        private _price: number,
        private _remarks1: string,
        private _remarks2: string,
        private _remarks3: string,
        private _assetClassDivision: string,
        private _parentId: string | null,
        private _designChangeNumber: number,
    ) {}

    public get id(): string {
        return this._id;
    }
    public get constructionType(): string {
        return this._constructionType;
    }
    public get constructionTime(): string {
        return this._constructionTime;
    }
    public get transportationTime(): string {
        return this._transportationTime;
    }
    public get code(): number | null {
        return this._code;
    }
    public get name(): string {
        return this._name;
    }
    public get dimension(): string {
        return this._dimension;
    }
    public get amount(): number {
        return this._amount;
    }
    public get unit(): string {
        return this._unit;
    }
    public get unitPrice(): number {
        return this._unitPrice;
    }
    public get price(): number {
        return this._price;
    }
    public get remarks1(): string {
        return this._remarks1;
    }
    public get remarks2(): string {
        return this._remarks2;
    }
    public get remarks3(): string {
        return this._remarks3;
    }
    public get assetClassDivision(): string {
        return this._assetClassDivision;
    }
    public get parentId(): string | null {
        return this._parentId;
    }
    public get designChangeNumber(): number {
        return this._designChangeNumber;
    }

    public isExpence(): boolean {
        return CostItem.isExpence(this._constructionType);
    }

    public isDirectExpence(): boolean {
        return CostItem.isDirectExpence(this._constructionType);
    }

    public isCommonExpence(): boolean {
        return CostItem.isCommonExpence(this._constructionType);
    }

    public isLinked(): boolean {
        return this._parentId !== null;
    }

    public hasError(): boolean {
        return !this.isLinked() || this._amount < 0;
    }

    public resetLink(): CostItem {
        const ret = this.clone();
        ret._parentId = null;
        return ret;
    }

    public setParentId(parentId: string | null): CostItem {
        const ret = this.clone();
        ret._parentId = parentId;
        return ret;
    }

    public merge(target: CostItem): CostItem {
        const ret = target.clone();
        ret._parentId = this.id;
        ret._price += this._price;
        if (this._constructionType === '共通仮設費') {
            ret._unitPrice += this._unitPrice;
        } else {
            ret._amount += this._amount;
        }
        return ret;
    }

    public isSame(target: CostItem): boolean {
        return (
            convertToAscii(this._name) === convertToAscii(target._name) &&
            this._unitPrice === target._unitPrice &&
            this._constructionType === target._constructionType &&
            this._dimension === target._dimension
        );
    }

    public clone(): CostItem {
        return new CostItem(
            this.id,
            this.constructionType,
            this.constructionTime,
            this.transportationTime,
            this.code,
            this.name,
            this.dimension,
            this.amount,
            this.unit,
            this.unitPrice,
            this.price,
            this.remarks1,
            this.remarks2,
            this.remarks3,
            this.assetClassDivision,
            this.parentId,
            this.designChangeNumber,
        );
    }

    public static isExpence(type: string): boolean {
        return (
            ['直接仮設工事', '部分撤去工事'].includes(type) ||
            this.isCommonExpence(type)
        );
    }

    public static isDirectExpence(type: string): boolean {
        return !this.isCommonExpence(type);
    }

    public static isCommonExpence(type: string): boolean {
        return [
            '共通仮設費',
            '現場管理費',
            '一般管理費',
            // @todo 暫定対応
            '現場管理費・一般管理費等',
        ].includes(type);
    }

    public static createFromMaster(master: CostItemMaster): CostItem {
        return new CostItem(
            master.id,
            master.constructionType,
            master.constructionTime,
            master.transportationTime,
            master.code,
            master.name,
            master.dimension,
            master.amount,
            master.unit,
            master.unitPrice,
            master.price,
            master.remarks1,
            master.remarks2,
            master.remarks3,
            master.assetClassDivision,
            master.designChangeNumber === 0 ? master.id : null,
            master.designChangeNumber,
        );
    }
}
