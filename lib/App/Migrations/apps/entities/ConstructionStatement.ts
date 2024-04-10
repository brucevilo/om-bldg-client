import { AssetItemMaster, ConstructionStatementMaster } from '../CostDocument';
import { AssetClassDivision } from './AssetClassDivision';
import { CostItem } from './CostItem';

export class ConstructionStatement {
    public static readonly NAME_UNKNOWN = '未特定';
    public static readonly NAME_NEW = '新規工事明細';

    public constructor(
        private _designChangeNumber: number,
        private _name: string,
        private _items: CostItem[],
        private _parentName: string,
        private _assetItemsMaster: AssetItemMaster[],
        private _assetClassDivisions: AssetClassDivision[],
    ) {
        this._updateAssetClassDivisions();
    }

    public get designChangeNumber(): number {
        return this._designChangeNumber;
    }
    public get name(): string {
        return this._name;
    }
    public get items(): CostItem[] {
        return [...this._items];
    }
    public get parentName(): string {
        return this._parentName;
    }

    public setDesignChangeNumber(number: number): ConstructionStatement {
        const ret = this.clone();
        ret._designChangeNumber = number;
        return ret;
    }
    public setParentName(name: string): ConstructionStatement {
        const ret = this.clone();
        ret._parentName = name;
        return ret;
    }

    public get uniqueName(): string {
        return this._parentName === ConstructionStatement.NAME_NEW ||
            this._parentName === ConstructionStatement.NAME_UNKNOWN
            ? this._name
            : this._parentName;
    }

    public get assetItemsMaster(): AssetItemMaster[] {
        return [...this._assetItemsMaster];
    }

    public get assetClassDivisions(): AssetClassDivision[] {
        return [...this._assetClassDivisions];
    }

    public hasError(): boolean {
        return (
            !this.isLinked() || !this.isItemLinked() || !this.isAssetLinked()
        );
    }

    public isAssetLinked(): boolean {
        return !(
            this._assetClassDivisions.length > 0 &&
            this._assetClassDivisions.filter(
                a => a.assetKey === AssetClassDivision.KEY_UNKNOWN,
            ).length > 0
        );
    }

    public isLinked(): boolean {
        return this._parentName !== ConstructionStatement.NAME_UNKNOWN;
    }

    public isItemLinked(): boolean {
        return (
            this._items.length === 0 ||
            !this._items.some(item => !item.isLinked())
        );
    }

    public hasItemInvalid(): boolean {
        return (
            this._items.length > 0 && this._items.some(item => item.amount < 0)
        );
    }

    private _updateAssetClassDivisions() {
        const priceMap: {
            [type: string]: number;
        } = {};
        this._items.forEach(item => {
            if (priceMap[item.assetClassDivision] === undefined) {
                priceMap[item.assetClassDivision] = 0;
            }
            priceMap[item.assetClassDivision] += item.price;
        });
        this._assetClassDivisions = Object.keys(priceMap).map(type => {
            const acd = this._assetClassDivisions.find(a => a.type === type);
            if (acd === undefined) {
                return new AssetClassDivision(type, priceMap[type]);
            } else {
                return acd.setPrice(priceMap[type]);
            }
        });
    }

    public updateAssetClassDivisions(
        cs: ConstructionStatement,
    ): ConstructionStatement {
        const ret = this.clone();
        ret._assetClassDivisions = ret._assetClassDivisions.map(acd => {
            const macd = cs.assetClassDivisions.find(
                macd => macd.type === acd.type,
            );
            if (!macd) {
                return acd;
            }
            return acd.setAssetKey(macd.assetKey);
        });
        return ret;
    }

    public updateAssetClassDivision(
        newItem: AssetClassDivision,
    ): ConstructionStatement {
        const ret = this.clone();
        ret._assetClassDivisions = ret._assetClassDivisions.map(item => {
            if (item.type === newItem.type) {
                return newItem;
            }
            return item;
        });
        ret._updateAssetClassDivisions();
        return ret;
    }

    public addCostItem(...newItem: CostItem[]): ConstructionStatement {
        const ret = this.clone();
        ret._items = ret._items.concat(newItem);
        ret._updateAssetClassDivisions();
        return ret;
    }

    public updateCostItem(newItem: CostItem): ConstructionStatement {
        const ret = this.clone();
        ret._items = ret._items.map(item => {
            if (item.id === newItem.id) {
                return newItem;
            }
            return item;
        });
        ret._updateAssetClassDivisions();
        return ret;
    }

    public mergeCostItem(
        prevItem: CostItem,
        newItem: CostItem,
    ): ConstructionStatement {
        const ret = this.clone();
        ret._items = ret._items.flatMap(item => {
            if (item.id === prevItem.id) {
                const merged = prevItem.merge(newItem);
                if (merged.price === 0) {
                    return [];
                }
                return merged;
            }
            return item;
        });
        ret._updateAssetClassDivisions();
        return ret;
    }

    public resetItems(): ConstructionStatement {
        const ret = this.clone();
        ret._items = [];
        ret._updateAssetClassDivisions();
        return ret;
    }

    public resetItemLink(): ConstructionStatement {
        const ret = this.clone();
        ret._items = this._items.map(item => item.resetLink());
        return ret;
    }

    public addAssetItemMaster(
        ...newItem: AssetItemMaster[]
    ): ConstructionStatement {
        const ret = this.clone();
        ret._assetItemsMaster = ret._assetItemsMaster.concat(newItem);
        return ret;
    }

    public updateAssetItemMaster(
        newItem: AssetItemMaster,
    ): ConstructionStatement {
        const ret = this.clone();
        ret._assetItemsMaster = ret._assetItemsMaster.map(item => {
            if (
                item.assetName === newItem.assetName &&
                item.price === newItem.prevPrice
            ) {
                return newItem;
            }
            return item;
        });
        return ret;
    }

    public clone(): ConstructionStatement {
        return new ConstructionStatement(
            this.designChangeNumber,
            this.name,
            this.items,
            this.parentName,
            this.assetItemsMaster,
            this.assetClassDivisions,
        );
    }

    public static createFromMaster(
        master: ConstructionStatementMaster,
    ): ConstructionStatement {
        return new ConstructionStatement(
            master.designChangeNumber,
            master.name,
            master.items.map(i => CostItem.createFromMaster(i)),
            master.designChangeNumber === 0
                ? ConstructionStatement.NAME_NEW
                : ConstructionStatement.NAME_UNKNOWN,
            master.assets,
            [],
        );
    }
}
