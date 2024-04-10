import { Contract } from '@/Domain/Entity';
import { UpdateMigratedContractParams } from '@/Domain/Service/GenerateUpdateContractParamsFromAssessmentFileService';
import { AttachmentInfo } from '@/Domain/ValueObject';

export interface EditMigratedDesignContractParams {
    id: number | null;
    // 仕様書（工事の設計書と同じ）
    spec_file_base64: string | null;
    spec_file_name: string | null;
    spec_file_info: AttachmentInfo;
    // 内訳書
    cost_document_base64: string | null;
    cost_document_name: string | null;
    cost_document_info: AttachmentInfo;
    // 稟議書
    approval_file_base64: string | null;
    approval_file_name: string | null;
    approval_file_info: AttachmentInfo;
    // 契約書
    contract_file_base64: string | null;
    contract_file_name: string | null;
    contract_file_info: AttachmentInfo;
    // 査定表
    assessment_file_base64: string | null;
    assessment_file_name: string | null;
    assessment_file_info: AttachmentInfo;
    // 工事管理シート（元設計にのみアップロード）
    manage_sheet_base64: string | null;
    manage_sheet_name: string | null;
    manage_sheet_info: AttachmentInfo;
    // 査定表アップロード時に査定表の中身を元にContractを更新するParams生成する
    update_migrated_contract_params: UpdateMigratedContractParams | null;
}

export interface EditMigratedDesignContractForm {
    id: number | null;
    // 設計書
    specFileBase64: string | null;
    specFileName: string | null;
    specFileInfo: AttachmentInfo;
    // 完成明細書、普段の内訳書と同じカラム
    costDocumentBase64: string | null;
    costDocumentName: string | null;
    costDocumentInfo: AttachmentInfo;
    // 稟議書
    approvalFileBase64: string | null;
    approvalFileName: string | null;
    approvalFileInfo: AttachmentInfo;
    // 契約書
    contractFileBase64: string | null;
    contractFileName: string | null;
    contractFileInfo: AttachmentInfo;
    // 査定表
    assessmentFileBase64: string | null;
    assessmentFileName: string | null;
    assessmentFileInfo: AttachmentInfo;
    // 工事管理シート
    manageSheetBase64: string | null;
    manageSheetName: string | null;
    manageSheetInfo: AttachmentInfo;
    // 査定表アップロード時に査定表の中身を元にContractを更新するParams生成する
    updateMigratedContractParams: UpdateMigratedContractParams | null;
}

export class EditMigratedDesign {
    static createEmptyForm(): EditMigratedDesignContractForm {
        return {
            id: null,
            specFileBase64: null,
            specFileName: null,
            specFileInfo: null,
            costDocumentBase64: null,
            costDocumentName: null,
            costDocumentInfo: null,
            approvalFileBase64: null,
            approvalFileName: null,
            approvalFileInfo: null,
            contractFileBase64: null,
            contractFileName: null,
            contractFileInfo: null,
            assessmentFileBase64: null,
            assessmentFileName: null,
            assessmentFileInfo: null,
            manageSheetBase64: null,
            manageSheetName: null,
            manageSheetInfo: null,
            updateMigratedContractParams: null,
        };
    }

    static contractToForm(contract: Contract): EditMigratedDesignContractForm {
        // すでにファイルが添付されているかどうかは各種Infoの有無で判定し、Base64とNameは更新用ファイルをアップロードしたときに初めてsetStateされるためnull
        return {
            id: contract.id,
            specFileBase64: null,
            specFileName: null,
            specFileInfo: contract.specFileInfo,
            costDocumentBase64: null,
            costDocumentName: null,
            costDocumentInfo: contract.costDocumentInfo,
            approvalFileBase64: null,
            approvalFileName: null,
            approvalFileInfo: contract.approvalFileInfo,
            contractFileBase64: null,
            contractFileName: null,
            contractFileInfo: contract.contractFileInfo,
            assessmentFileBase64: null,
            assessmentFileName: null,
            assessmentFileInfo: contract.assessmentFileInfo,
            manageSheetBase64: null,
            manageSheetName: null,
            manageSheetInfo: contract.manageSheetInfo,
            updateMigratedContractParams: null,
        };
    }

    static formToContractParams(
        forms: EditMigratedDesignContractForm[],
    ): EditMigratedDesignContractParams[] {
        return forms.map(form => {
            return {
                id: form.id,
                spec_file_base64: form.specFileBase64,
                spec_file_name: form.specFileName,
                spec_file_info: form.specFileInfo,
                cost_document_base64: form.costDocumentBase64,
                cost_document_name: form.costDocumentName,
                cost_document_info: form.costDocumentInfo,
                approval_file_base64: form.approvalFileBase64,
                approval_file_name: form.approvalFileName,
                approval_file_info: form.approvalFileInfo,
                contract_file_base64: form.contractFileBase64,
                contract_file_name: form.contractFileName,
                contract_file_info: form.contractFileInfo,
                assessment_file_base64: form.assessmentFileBase64,
                assessment_file_name: form.assessmentFileName,
                assessment_file_info: form.assessmentFileInfo,
                manage_sheet_base64: form.manageSheetBase64,
                manage_sheet_name: form.manageSheetName,
                manage_sheet_info: form.manageSheetInfo,
                update_migrated_contract_params:
                    form.updateMigratedContractParams,
            };
        });
    }
}
