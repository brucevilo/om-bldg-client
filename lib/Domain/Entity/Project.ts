import { Entity, Timestamps } from '.';
import { AttachmentInfo } from '../ValueObject';

export enum ProjectClassification {
    InvestmentBudget = 'investment_budget',
    RemovalCost = 'removal_cost',
    RepairCost = 'repair_cost',
}
export class Project implements Entity, Timestamps {
    /**
     * 企画
     * @param id
     * @param name 事業名
     * @param code プロジェクトコード
     * @param budget 予算
     * @param file 添付ファイル（作成・更新時のみ）
     * @param fileUrl 添付ファイルURL（取得時のみ）
     * @param note メモ
    /** */
    constructor(
        public id: number | null,
        public name: string,
        public code: string,
        public budget: number,
        public file: File | null,
        public fileInfo: AttachmentInfo,
        public note: string,
        public classification: ProjectClassification,
        public targetYear: number | null,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}

    get classificationText(): string {
        switch (this.classification) {
            case ProjectClassification.InvestmentBudget:
                return '投資予算';
            case ProjectClassification.RemovalCost:
                return '撤去費';
            case ProjectClassification.RepairCost:
                return '修繕費';
        }
    }
}
