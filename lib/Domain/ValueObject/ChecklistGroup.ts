import { CostItem, SapFixedAsset } from '../Entity';

export class ChecklistGroup {
    constructor(
        public sapFixedAsset: SapFixedAsset,
        public costItems: CostItem[],
    ) {}

    static parsedChecklist(storedChecklist: string): ChecklistGroup[] {
        const storageItem: {
            sapFixedAsset: SapFixedAsset;
            costItems: CostItem[];
        }[] = JSON.parse(storedChecklist);
        return storageItem.map(s => {
            return new ChecklistGroup(s.sapFixedAsset, s.costItems);
        });
    }
}
