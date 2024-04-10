import { ConstructionStatementFactory } from './ConstructionStatementFactory';
import { Contract, ContractNextAction } from '../Entity';
import {
    ConstructionFactory,
    ConstructionResponse,
    ConstructionStatementResponse,
    DesignFactory,
    DesignResponse,
} from '../Factory';
import { AttachmentInfo } from '../ValueObject';

export interface ContractResponse {
    id: number;
    contract_number: string | null;
    spec_file_info?: AttachmentInfo;
    cost_document_info?: AttachmentInfo;
    estimation_sheet_info?: AttachmentInfo;
    manage_sheet_info?: AttachmentInfo;
    approval_number: string | null;
    approval_file_info?: AttachmentInfo;
    approval_memo: string | null;
    sap_record_import_manage_sheet_info?: AttachmentInfo;
    design_id: number | null;
    construction_id: number | null;
    request_memo: string | null;
    expected_price: number | null;
    expected_price_with_tax: number | null;
    contracted_price: number | null;
    contract_at: string | null;
    memo: string | null;
    inquiry_at: string | null;
    inquiry_file_info?: AttachmentInfo;
    inquiry_memo: string | null;
    expected_construction_order_date_when_designing: string | null;
    scheduled_acceptance_date: string | null;
    expected_start_at: string | null;
    expected_end_at: string | null;
    start_at: string | null;
    end_at: string | null;
    next_action: ContractNextAction;
    supplier_id: number | null;
    bid_method: string | null;
    inquiry_by_id: number | null;
    design_staff_id: number | null;
    design_chief_id: number | null;
    construction_staff_id: number | null;
    construction_chief_id: number | null;
    completed_by_id: number | null;
    completed_at: string | null;
    contract_file_info?: AttachmentInfo;
    assessment_file_info?: AttachmentInfo;
    migrated_handover_document_info?: AttachmentInfo;
    owner_id: number | null;
    created_at: string;
    updated_at: string;
    is_construction_period_changed: boolean;
    is_processing: boolean;
    construction_statements: ConstructionStatementResponse[];
    construction?: ConstructionResponse;
    design?: DesignResponse;
}

function dateIfExists(dateStringOrNull: string | null) {
    return dateStringOrNull ? new Date(dateStringOrNull) : null;
}

export class ContractFactory {
    static createFromResponse(res: ContractResponse): Contract {
        const construction = res.construction
            ? ConstructionFactory.createFromResponse(res.construction)
            : null;
        const design = res.design
            ? DesignFactory.createFromResponse(res.design)
            : null;
        const constructionStatements =
            res.construction_statements?.map(
                ConstructionStatementFactory.createFromResponse,
            ) || null;

        return new Contract({
            id: res.id,
            contractNumber: res.contract_number,
            specFileInfo: res.spec_file_info,
            costDocumentInfo: res.cost_document_info,
            manageSheetInfo: res.manage_sheet_info,
            approvalNumber: res.approval_number,
            approvalFileInfo: res.approval_file_info,
            approvalMemo: res.approval_memo,
            sapRecordImportManageSheetInfo:
                res.sap_record_import_manage_sheet_info,
            designId: res.design_id,
            constructionId: res.construction_id,
            requestMemo: res.request_memo,
            expectedPrice: res.expected_price,
            expectedPriceWithTax: res.expected_price_with_tax,
            contractedPrice: res.contracted_price,
            contractAt: dateIfExists(res.contract_at),
            memo: res.memo,
            inquiryAt: dateIfExists(res.inquiry_at),
            inquiryFileInfo: res.inquiry_file_info,
            inquiryMemo: res.inquiry_memo,
            scheduledAcceptanceDate: dateIfExists(
                res.scheduled_acceptance_date,
            ),
            expectedConstructionOrderDateWhenDesigning: dateIfExists(
                res.expected_construction_order_date_when_designing,
            ),
            expectedStartAt: dateIfExists(res.expected_start_at),
            expectedEndAt: dateIfExists(res.expected_end_at),
            startAt: dateIfExists(res.start_at),
            endAt: dateIfExists(res.end_at),
            nextAction: res.next_action,
            supplierId: res.supplier_id,
            bidMethod: res.bid_method || '',
            inquiryById: res.inquiry_by_id,
            designStaffId: res.design_staff_id,
            designChiefId: res.design_chief_id,
            constructionStaffId: res.construction_staff_id,
            constructionChiefId: res.construction_chief_id,
            completedById: res.completed_by_id,
            completedAt: res.completed_at ? new Date(res.completed_at) : null,
            ownerId: res.owner_id,
            contractFileInfo: res.contract_file_info,
            assessmentFileInfo: res.assessment_file_info,
            migratedHandoverDocumentInfo: res.migrated_handover_document_info,
            createdAt: new Date(res.created_at),
            updatedAt: new Date(res.updated_at),
            isConstructionPeriodChanged: res.is_construction_period_changed,
            ...(construction && { construction }),
            ...(design && { design }),
            ...(constructionStatements && {
                constructionStatements,
            }),
            isProcessing: res.is_processing,
        });
    }
}
