import { ConstructionStatement } from '@/Domain/Entity';
import { AttachmentInfo } from '../ValueObject';
import { Entity } from './Entity';
import { Timestamps } from './TimeStamps';
import { Construction, Design } from './index';

export type ContractNextAction =
    | 'upload_cost_document'
    | 'approval'
    | 'inquiry'
    | 'agreement'
    // 設計の最終ステータスはconstruction(設計一覧の工事登録タブ)
    | 'construction'
    | 'construction_in_progress'
    | 'retirement_and_construction_in_progress'
    | 'retirement'
    // 工事の最終ステータスはcompleted(工事一覧の工事完了タブ)
    | 'completed';

export class Contract implements Entity, Timestamps {
    /**
     * 契約（設計(design)も工事(construction)も必要な値が似通っているため(?)Contractという共通のモデルを用いているらしい）
     * 各カラムに対応する日本語名は誤っている可能性もありますのでご了承ください
     * @param id: number;
     * @param contractNumber: 契約番号
     * @param specFile: 仕様書 設計書、設計委託仕様書とも呼ばれる
     * @param specFileInfo:
     * @param costDocument: 内訳書、移行ツールの場合は完成明細書（名前は違うが中身は一緒）
     * @param costDocumentInfo:
     * @param estimationSheet: 積算登録エクセル
     * @param estimationSheetInfo:
     * @param manageSheet: 工事管理シート
     * @param manageSheetInfo:
     * @param approvalNumber: 工事稟議番号
     * @param approvalFile: 稟議書
     * @param approvalFileInfo:
     * @param approvalMemo: 契約伺いのときのメモ
     * @param sapRecordImportManageSheetInfo:
     * @param designId: 設計ID
     * @param constructionId: 工事ID
     * @param requestMemo:
     * @param expectedPrice: 予定価格
     * @param expectedPriceWithTax: 税込予定価格
     * @param contractedPrice: 契約価格
     * @param contractAt: 契約日
     * @param memo: 契約登録のときのメモ
     * @param inquiryAt: 契約伺いの起票日
     * @param inquiryFileInfo:
     * @param inquiryMemo:
     * @param expectedConstructionOrderDateWhenDesigning:
     * @param scheduledAcceptanceDate:
     * @param expectedStartAt:
     * @param expectedEndAt:
     * @param startAt: 工事開始日
     * @param endAt: 工事終了日
     * @param nextAction: ネクストアクション
     * @param supplierId:  受注者名？、本来契約登録の時に登録する値のため、査定表の請負者名と同様でいい気がする
     * @param bidMethod: ‘一般競争入札‘, ‘指名競争入札‘, ‘指定契約’の3種があるらしい
     * @param inquiryById: 契約伺いをした人
     * @param designStaffId:  設計担当者
     * @param designChiefId: 設計担当係長
     * @param constructionStaffId: 工事担当者
     * @param constructionChiefId: 工事担当係長
     * @param completedById:
     * @param completedAt:
     * @param ownerId:
     * @param createdAt:
     * @param updatedAt:
     */
    public id: number;
    public contractNumber: string | null;
    public specFile: File | null;
    public specFileInfo: AttachmentInfo;
    public costDocument: File | null;
    public costDocumentInfo: AttachmentInfo;
    public manageSheet: File | null;
    public manageSheetInfo: AttachmentInfo;
    public approvalNumber: string | null;
    public approvalFile: File | null;
    public approvalFileInfo: AttachmentInfo;
    public approvalMemo: string | null;
    public sapRecordImportManageSheetInfo: AttachmentInfo;
    public designId: number | null;
    public constructionId: number | null;
    public requestMemo: string | null;
    public expectedPrice: number | null;
    public expectedPriceWithTax: number | null;
    public contractedPrice: number | null;
    public contractAt: Date | null;
    public memo: string | null;
    public inquiryAt: Date | null;
    public inquiryFileInfo: AttachmentInfo;
    public inquiryMemo: string | null;
    public expectedConstructionOrderDateWhenDesigning: Date | null;
    public scheduledAcceptanceDate: Date | null;
    public expectedStartAt: Date | null;
    public expectedEndAt: Date | null;
    public startAt: Date | null;
    public endAt: Date | null;
    public nextAction: ContractNextAction;
    public supplierId: number | null;
    public bidMethod: string;
    public inquiryById: number | null;
    public designStaffId: number | null;
    public designChiefId: number | null;
    public constructionStaffId: number | null;
    public constructionChiefId: number | null;
    public completedById: number | null;
    public completedAt: Date | null;
    public ownerId: number | null;
    public contractFile: File | null;
    public contractFileInfo: AttachmentInfo;
    public assessmentFile: File | null;
    public assessmentFileInfo: AttachmentInfo;
    public migratedHandoverDocument: File | null;
    public migratedHandoverDocumentInfo: AttachmentInfo;
    public createdAt: Date;
    public updatedAt: Date;
    public isConstructionPeriodChanged: boolean;
    public construction: Construction | null;
    public design: Design | null;
    public constructionStatements: ConstructionStatement[] | [];
    public isProcessing: boolean;
    constructor(init: Partial<Contract>) {
        this.id = init.id || 0;
        this.contractNumber = init.contractNumber || null;
        this.specFile = init.specFile || null;
        this.specFileInfo = init.specFileInfo || null;
        this.costDocument = init.costDocument || null;
        this.costDocumentInfo = init.costDocumentInfo || null;
        this.manageSheet = init.manageSheet || null;
        this.manageSheetInfo = init.manageSheetInfo || null;
        this.approvalNumber = init.approvalNumber || null;
        this.approvalFile = init.approvalFile || null;
        this.approvalFileInfo = init.approvalFileInfo || null;
        this.approvalMemo = init.approvalMemo || null;
        this.sapRecordImportManageSheetInfo =
            init.sapRecordImportManageSheetInfo || null;
        this.designId = init.designId || null;
        this.constructionId = init.constructionId || null;
        this.requestMemo = init.requestMemo || null;
        this.expectedPrice = init.expectedPrice || null;
        this.expectedPriceWithTax = init.expectedPriceWithTax || null;
        this.contractedPrice = init.contractedPrice || null;
        this.contractAt = init.contractAt || null;
        this.memo = init.memo || null;
        this.inquiryAt = init.inquiryAt || null;
        this.inquiryFileInfo = init.inquiryFileInfo || null;
        this.inquiryMemo = init.inquiryMemo || null;
        this.expectedConstructionOrderDateWhenDesigning =
            init.expectedConstructionOrderDateWhenDesigning || null;
        this.scheduledAcceptanceDate = init.scheduledAcceptanceDate || null;
        this.expectedStartAt = init.expectedStartAt || null;
        this.expectedEndAt = init.expectedEndAt || null;
        this.startAt = init.startAt || null;
        this.endAt = init.endAt || null;
        this.nextAction = init.nextAction || 'upload_cost_document';
        this.supplierId = init.supplierId || null;
        this.bidMethod = init.bidMethod || '';
        this.inquiryById = init.inquiryById || null;
        this.designStaffId = init.designStaffId || null;
        this.designChiefId = init.designChiefId || null;
        this.constructionStaffId = init.constructionStaffId || null;
        this.constructionChiefId = init.constructionChiefId || null;
        this.completedById = init.completedById || null;
        this.completedAt = init.completedAt || null;
        this.ownerId = init.ownerId || null;
        this.contractFile = init.contractFile || null;
        this.contractFileInfo = init.contractFileInfo || null;
        this.assessmentFile = init.assessmentFile || null;
        this.assessmentFileInfo = init.assessmentFileInfo || null;
        this.migratedHandoverDocument = init.migratedHandoverDocument || null;
        this.migratedHandoverDocumentInfo =
            init.migratedHandoverDocumentInfo || null;
        this.createdAt = init.createdAt || new Date();
        this.updatedAt = init.updatedAt || new Date();
        this.isConstructionPeriodChanged =
            init.isConstructionPeriodChanged || false;
        this.isProcessing = init.isProcessing || false;
        this.construction = init.construction || null;
        this.design = init.design || null;
        this.constructionStatements = init.constructionStatements || [];
    }

    get tax(): number {
        if (!this.expectedPrice || !this.expectedPriceWithTax) return 0;
        return this.expectedPriceWithTax - this.expectedPrice;
    }

    // %で返す
    get taxRate(): number {
        const rt = Math.round(
            ((this.expectedPriceWithTax || 0) / (this.expectedPrice || 0)) *
                100 -
                100,
        );
        return rt;
    }

    get rate(): number {
        if (!this.expectedPriceWithTax || !this.contractedPrice) return 0;
        return this.contractedPrice / this.expectedPriceWithTax;
    }

    get rateDown4(): number {
        if (!this.expectedPriceWithTax || !this.contractedPrice) return 0;
        return (
            Math.floor(
                (this.contractedPrice / this.expectedPriceWithTax) * 10000,
            ) / 10000
        );
    }

    get isPrivatized(): boolean {
        return this.memo !== '【共通】民営化前契約';
    }

    // 1. 消費税が切り捨てのためfloor
    // 2. 整数割る小数は誤差が発生するため100掛けて計算する
    get contractedPriceWithoutTax(): number {
        return Math.floor(
            ((this.contractedPrice || 0) * 100) / (100 + this.taxRate),
        );
    }

    get isDisplayDistributedPrice(): boolean {
        return (
            this.nextAction !== 'upload_cost_document' &&
            this.nextAction !== 'approval' &&
            this.nextAction !== 'inquiry' &&
            this.nextAction !== 'agreement'
        );
    }
}
