import {
    AssetChecklist,
    AssetClass,
    CostItem,
    CostItemTag,
} from '@/Domain/Entity';
import { AttachmentInfo, ConstructionType } from '@/Domain/ValueObject';

export interface EditCostItemForm {
    id: number | null;
    constructionStatementId: number | null;
    name: string;
    constructionType: ConstructionType;
    code: number | null;
    dimension: string;
    amount: number;
    unit: string;
    unitPrice: number;
    price: number;
    constructionTime: string;
    transportationTime: string;
    remarks: string;
    assetClass: AssetClass | null;
    costItemTags: CostItemTag[];
    assetCheckLists: AssetChecklist[];
    memo: string;
    photosInfo: AttachmentInfo[];
    mergedCostItemId: number | null;
    estimateAmount: number | null;
    estimatePrice: number | null;
    assetClassInfo: string | null;
}

export class EditCostItem {
    static costItemToForm(costItem: CostItem): EditCostItemForm {
        return {
            id: costItem.id,
            constructionStatementId: costItem.constructionStatementId,
            name: costItem.name,
            constructionType: costItem.constructionType,
            code: costItem.code,
            dimension: costItem.dimension,
            amount: costItem.amount,
            unit: costItem.unit,
            unitPrice: costItem.unitPrice,
            price: costItem.price,
            constructionTime: costItem.constructionTime,
            transportationTime: costItem.transportationTime,
            remarks: costItem.remarks,
            assetClass: costItem.assetClass,
            costItemTags: costItem.costItemTags,
            assetCheckLists: costItem.assetChecklists,
            memo: costItem.memo,
            photosInfo: costItem.photosInfo,
            mergedCostItemId: costItem.mergedCostItemId,
            estimateAmount: costItem.estimateAmount,
            estimatePrice: costItem.estimatePrice,
            assetClassInfo: costItem.assetClassInfo,
        };
    }

    static formToCostItem(form: EditCostItemForm): CostItem {
        return new CostItem(
            form.id,
            form.constructionStatementId,
            form.name,
            form.constructionType,
            form.code,
            form.dimension,
            form.amount,
            form.unit,
            form.unitPrice,
            form.price,
            form.constructionTime,
            form.transportationTime,
            form.remarks,
            form.assetClass,
            form.costItemTags,
            form.assetCheckLists,
            form.memo,
            form.photosInfo,
            form.mergedCostItemId,
            form.estimatePrice,
            form.estimateAmount,
            form.assetClassInfo,
            new Date(),
            new Date(),
        );
    }
}
