export const ConstructionType = [
    '直接仮設工事',
    'タイル工事',
    '金属工事',
    '左官工事',
    '塗装工事',
    '内装工事',
    'ユニット及びその他の工事',
    '部分撤去工事',
    '共通仮設費',
    '現場管理費',
    '一般管理費等',
    // @todo 暫定対応
    '現場管理費・一般管理費等',
    '土工事',
    '地業工事',
    '鉄筋工事',
    'コンクリート工事',
    '鉄骨工事',
    'コンクリートブロック・ＡＬＣパネル・押出成形セメント板工事',
    '防水工事',
    '石工事',
    '木工事',
    '屋根及びとい工事',
    '建具工事',
    'カーテンウォール工事',
    '排水工事',
    '舗装工事',
    '植栽及び屋上緑化工事',
    'とりこわし工事',
    '直接工事',
    'コンクリートブロック・ＡＬＣパネル・押出成形セメント板工事',
    'CB工事',
    'ガラス工事',
] as const;
export type ConstructionType = typeof ConstructionType[number];

export class ConstructionTypes {
    // 資産化する（=資産化しない工種でない）工種
    static isCapitalization(type: ConstructionType): boolean {
        return ![
            '直接仮設工事',
            '部分撤去工事',
            '共通仮設費',
            '現場管理費',
            '一般管理費等',
            // @todo 暫定対応
            '現場管理費・一般管理費等',
            '直接工事',
        ].includes(type);
    }

    static isExpense(type: ConstructionType): boolean {
        return !ConstructionTypes.isCapitalization(type);
    }

    static get COMMON_EXPENCE(): ConstructionType[] {
        return [
            '共通仮設費',
            '現場管理費',
            '一般管理費等',
            // @todo 暫定対応
            '現場管理費・一般管理費等',
        ];
    }
    // 共通費の工種
    static isCommonExpence(type: ConstructionType): boolean {
        return this.COMMON_EXPENCE.includes(type);
    }

    // 直接工事費（=共通費でない）の工種
    static isDirectExpence(type: ConstructionType): boolean {
        return !this.isCommonExpence(type);
    }

    static isUnitPriceIsPrice(type: ConstructionType): boolean {
        return [
            '共通仮設費',
            '現場管理費',
            '一般管理費等',
            '現場管理費・一般管理費等',
            '直接仮設工事',
        ].includes(type);
    }
}
