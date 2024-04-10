import { Construction } from '@/Domain/Entity';

export interface EditMigratedConstructionAndContractParams {
    // GenerateUpdateContractParamsFromAssessmentFileServiceでも更新できる値
    // 該当の入力欄がない査定表フォーマットが存在するため、手入力でも編集できるようにする
    id: number | null;
    approval_number: string | null;
    document_number: string | null;
    design_chief_id: number | null;
    design_staff_id: number | null;
    construction_chief_id: number | null;
    construction_staff_id: number | null;
    supplier_id: number | null;
    expected_price: number | null;
    contracted_price: number | null;
    // 編集画面からしか編集できない値
    last_contracted_price: number | null;
    end_at: Date | null;
    // 下記はすべての査定表フォーマットで入力欄が存在するため、編集画面から編集できないようにする
    contract_at: Date | null;
}

export interface EditMigratedConstructionAndContractForm {
    id: number | null;
    approvalNumber: string | null;
    documentNumber: string | null;
    designChiefId: number | null;
    designStaffId: number | null;
    constructionChiefId: number | null;
    constructionStaffId: number | null;
    supplierId: number | null;
    expectedPrice: number | null;
    firstContractedPrice: number | null;
    // 編集画面からしか編集できない値
    lastContractedPrice: number | null;
    endAt: Date | null;
    // 下記はすべての査定表フォーマットで入力欄が存在するため、編集画面から編集できないようにする
    contractAt: Date | null;
}

export class EditMigratedConstruction {
    static createEmptyForm(): EditMigratedConstructionAndContractForm {
        return {
            id: null,
            approvalNumber: null,
            documentNumber: null,
            designChiefId: null,
            designStaffId: null,
            constructionChiefId: null,
            constructionStaffId: null,
            supplierId: null,
            expectedPrice: null,
            firstContractedPrice: null,
            // 下記はすべての査定表フォーマットで入力欄が存在するため、編集画面から編集できないようにする
            contractAt: null,
            // 編集画面からしか編集できない値
            lastContractedPrice: null,
            endAt: null,
        };
    }

    static contractAndConstructionToForm(
        construction: Construction,
    ): EditMigratedConstructionAndContractForm {
        const contract = construction.contracts[0];
        const lastContractedPrice =
            construction.contracts.reverse()[0].contractedPrice;
        return {
            id: contract.id,
            approvalNumber: contract.approvalNumber,
            // documentNumberだけconstructionに紐づく
            documentNumber: construction.documentNumber.value,
            designChiefId: contract.designChiefId,
            designStaffId: contract.designStaffId,
            constructionChiefId: contract.constructionChiefId,
            constructionStaffId: contract.constructionStaffId,
            supplierId: contract.supplierId,
            expectedPrice: contract.expectedPrice,
            firstContractedPrice: contract.contractedPrice,
            lastContractedPrice: lastContractedPrice ? lastContractedPrice : 0,
            endAt: contract.endAt,
            contractAt: contract.contractAt,
        };
    }

    static formToContractParams(
        form: EditMigratedConstructionAndContractForm,
    ): EditMigratedConstructionAndContractParams {
        return {
            id: form.id,
            approval_number: form.approvalNumber,
            document_number: form.documentNumber,
            design_chief_id: form.designChiefId,
            design_staff_id: form.designStaffId,
            construction_chief_id: form.constructionChiefId,
            construction_staff_id: form.constructionStaffId,
            supplier_id: form.supplierId,
            expected_price: form.expectedPrice,
            // 基本的にEditMigratedConstructionAndContractParamsはcontracts.firstを更新するparamsなので、contracted_priceにfirstContractedPriceを入れる
            contracted_price: form.firstContractedPrice,
            // last_contracted_priceだけcontracts.lastを更新する値なのでlast_contracted_priceでサーバーに送ってcontracts.lastを更新する
            last_contracted_price: form.lastContractedPrice,
            end_at: form.endAt,
            contract_at: form.contractAt,
        };
    }
}
