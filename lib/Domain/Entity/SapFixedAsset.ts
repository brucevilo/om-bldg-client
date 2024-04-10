import { Entity, Timestamps } from '.';
import { AssetChecklist } from './AssetChecklist';

export class SapFixedAsset implements Entity, Timestamps {
    /**
     * SAP固定資産台帳
     * @param key キー
     * @param assetName 資産名称
     * @param assetText 資産テキスト
     * @param recordedAt 取得日
     * @param businessCode 事業コード
     * @param wbsCode WBS要素
     * @param assetClassCode 資産クラスコード
     * @param termEndPrice　取得価額(期末)
     */
    constructor(
        public id: number | null,
        public userId: number | null,
        public key: string,
        public assetName: string,
        public assetText: string,
        public recordedAt: Date,
        public businessCode: string,
        public wbsCode: string,
        public assetClassCode: string,
        public termEndPrice: number,
        public assetChecklists: AssetChecklist[],
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
