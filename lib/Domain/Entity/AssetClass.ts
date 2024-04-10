import { Entity, Timestamps } from '.';

export class AssetClass implements Entity, Timestamps {
    /**
     * 資産クラス
     * @param name 資産クラス名称
     * @param accountDivision 資産計上区分
     * @param code 資産クラスコード
     * @param usefulLife 耐用年数
     * @param category 資産クラス名分類
     * @param accountItemMoku 勘定科目「目」
     * @param accountItemKou 勘定科目「項」
     */
    constructor(
        public id: number | null,
        public name: string,
        public accountDivision: string,
        public code: number | null,
        public usefulLife: number | null,
        public category: string,
        public accountItemMoku: string,
        public accountItemKou: string,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
