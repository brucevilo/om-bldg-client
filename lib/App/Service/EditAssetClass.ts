import { AssetClass } from '@/Domain/Entity';

export interface EditAssetClassForm {
    id: number | null;
    name: string;
    accountDivision: string;
    code: number | null;
    usefulLife: number | null;
    category: string;
    accountItemMoku: string;
    accountItemKou: string;
}

export class EditAssetClass {
    static createEmptyForm(): EditAssetClassForm {
        return {
            id: null,
            name: '',
            accountDivision: '',
            code: null,
            usefulLife: null,
            category: '',
            accountItemMoku: '',
            accountItemKou: '',
        };
    }

    static assetClassToForm(assetClass: AssetClass): EditAssetClassForm {
        return {
            id: assetClass.id,
            name: assetClass.name,
            accountDivision: assetClass.accountDivision,
            code: assetClass.code,
            usefulLife: assetClass.usefulLife,
            category: assetClass.category,
            accountItemMoku: assetClass.accountItemMoku,
            accountItemKou: assetClass.accountItemKou,
        };
    }

    static formToAssetClass(form: EditAssetClassForm): AssetClass {
        return new AssetClass(
            form.id,
            form.name,
            form.accountDivision,
            form.code,
            form.usefulLife,
            form.category,
            form.accountItemMoku,
            form.accountItemKou,
            new Date(),
            new Date(),
        );
    }
}
