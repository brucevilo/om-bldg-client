import { AssetClass } from '../Entity';

export interface AssetClassResponse {
    id: number;
    name: string;
    account_division: string;
    code: number;
    useful_life: number;
    category: string;
    account_item_moku: string;
    account_item_kou: string;
    created_at: string;
    updated_at: string;
}

export class AssetClassFactory {
    static createFromResponse(res: AssetClassResponse): AssetClass {
        return new AssetClass(
            res.id,
            res.name,
            res.account_division,
            res.code,
            res.useful_life,
            res.category,
            res.account_item_moku,
            res.account_item_kou,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
