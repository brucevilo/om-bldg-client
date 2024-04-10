type HasAssetClassCode = {
    assetClassCode: string;
};

export class AssetClassDivision {
    public static readonly KEY_UNKNOWN = '未特定';
    public static readonly KEY_EXPENSE = '0';
    public static readonly TYPE_EXPENSE = '費用';

    public constructor(
        private _type: string,
        private _price: number,
        private _assetKey: string = AssetClassDivision.KEY_UNKNOWN,
    ) {
        if (this._type === AssetClassDivision.TYPE_EXPENSE) {
            this._assetKey = AssetClassDivision.KEY_EXPENSE;
        }
    }

    public get type(): string {
        return this._type;
    }
    public get price(): number {
        return this._price;
    }
    public get assetKey(): string {
        return this._assetKey;
    }

    public isLinked(): boolean {
        return this._assetKey !== AssetClassDivision.KEY_UNKNOWN;
    }

    public isExpense(): boolean {
        return this._assetKey === AssetClassDivision.KEY_EXPENSE;
    }

    public isCandidate(data: HasAssetClassCode): boolean {
        switch (this._type) {
            case '建物':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) < 10
                ) {
                    return true;
                }
                return false;
            case 'エヤーカーテンまたはドアー自動開閉設備':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 18
                ) {
                    return true;
                }
                return false;
            case 'アーケード又は日よけ設備（金属製）':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 19
                ) {
                    return true;
                }
                return false;
            case 'アーケード又は日よけ設備（その他）':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 20
                ) {
                    return true;
                }
                return false;
            case '店舗用簡易設備':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 21
                ) {
                    return true;
                }
                return false;
            case '可動間仕切り-簡易なもの':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 22
                ) {
                    return true;
                }
                return false;
            case '可動間仕切り-その他':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 23
                ) {
                    return true;
                }
                return false;
            case 'シャッター等（金属製）':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 24
                ) {
                    return true;
                }
                return false;
            case 'シャッター等（その他）':
                if (
                    data.assetClassCode.startsWith('105') &&
                    Number(data.assetClassCode.slice(-2)) === 25
                ) {
                    return true;
                }
                return false;
            case '電照サイン（金属製）':
            case '非電照サイン（金属製）':
            case '電照広告（金属製）':
            case '非電照広告（金属製）':
            case '電気設備':
                if (data.assetClassCode.startsWith('12505958')) {
                    return true;
                }
                return false;
            case '非電照サイン（その他）':
            case '非電照広告（その他）':
                if (data.assetClassCode.startsWith('12505959')) {
                    return true;
                }
                return false;
            case '無人駐車管理装置':
                if (data.assetClassCode.startsWith('12505988')) {
                    return true;
                }
                return false;
            case 'その他（金属製）':
                if (data.assetClassCode.startsWith('12505990')) {
                    return true;
                }
                return false;
            case 'その他（その他）':
                if (data.assetClassCode.startsWith('12505991')) {
                    return true;
                }
                return false;
            case '費用':
                return false;
            default:
                return true;
        }
    }

    public setPrice(price: number): AssetClassDivision {
        const ret = this.clone();
        ret._price = price;
        return ret;
    }

    public setAssetKey(assetKey: string): AssetClassDivision {
        const ret = this.clone();
        ret._assetKey = assetKey;
        return ret;
    }

    public clone(): AssetClassDivision {
        return new AssetClassDivision(this.type, this.price, this.assetKey);
    }
}
