import { Contract, Construction } from '../Entity';
import { getClient } from '@/Infrastructure';
import { ContractResponse, ContractFactory } from '../Factory';
import { snakeCase } from 'lodash';

interface EditContractRequest {
    contract_number: string;
    contract_at: string | null;
    construction_id: number | null;
    expected_price: number | null;
    expected_price_with_tax: number | null;
    design_id: number | null;
    spec_file: File | null;
    cost_document: File | null;
    contracted_price: number | null;
    memo: string | null;
    approval_number: string;
    approval_file: File | null;
    approval_memo: string | null;
    start_at: string;
    end_at: string;
    inquiry_at: string;
    inquiry_memo: string;
    supplier_id: number | null;
    bid_method: string;
    inquiry_by_id: number;
    design_staff_id: number | null;
    design_chief_id: number | null;
    construction_staff_id: number | null;
    construction_chief_id: number | null;
    next_action: string;
    is_construction_period_changed: boolean;
}

export class ContractRepository {
    static async get(id: number): Promise<Contract> {
        const res = await getClient().get<ContractResponse>(`/contracts/${id}`);
        return ContractFactory.createFromResponse(res.data);
    }

    static async list(): Promise<Contract[]> {
        const res = await getClient().get<ContractResponse[]>('/contracts');
        return res.data.map(ContractFactory.createFromResponse);
    }

    static async listContractsRelatedToSapFixedAsset({
        sapFixedAssetIDs,
    }: {
        sapFixedAssetIDs: string;
    }): Promise<Contract[]> {
        const res = await getClient().get<ContractResponse[]>(
            `/contracts/related_to_sap_fixed_asset?${sapFixedAssetIDs}`,
        );
        return res.data.map(ContractFactory.createFromResponse);
    }

    static async updateSpecFile({
        id,
        specFile,
    }: Partial<Contract>): Promise<Contract> {
        const params = { spec_file: specFile };
        const res = await getClient().formPatch<
            typeof params,
            ContractResponse
        >(`/contracts/${id}`, params);
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateManageSheet({
        id,
        manageSheet,
    }: Partial<Contract>): Promise<Contract> {
        const params = { manage_sheet: manageSheet };
        const res = await getClient().formPatch<
            typeof params,
            ContractResponse
        >(`/contracts/${id}`, params);
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateCostDocument({
        id,
        costDocument,
    }: Partial<Contract>): Promise<Contract> {
        const params = { cost_document: costDocument };
        const res = await getClient().formPatch<
            typeof params,
            ContractResponse
        >(`/contracts/${id}`, params);
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateEstimation({
        id,
        costDocument,
        expectedPrice,
        expectedPriceWithTax,
        manageSheet,
        bidMethod,
        endAt,
    }: Partial<Contract>): Promise<Contract> {
        const manageSheetParams = manageSheet
            ? { manage_sheet: manageSheet }
            : {};
        const params = {
            cost_document: costDocument,
            expected_price_with_tax: expectedPriceWithTax,
            expected_price: expectedPrice,
            bid_method: bidMethod,
            end_at: endAt,
            ...manageSheetParams,
        };
        const res = await getClient().formPost<typeof params, ContractResponse>(
            `/contracts/${id}/estimations`,
            params,
        );
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateApproval(params: {
        id: number;
        approvalFile: File;
        specFile: File;
        approvalMemo?: string;
        nextAction?: string;
    }): Promise<Contract> {
        const res = await getClient().formPatch<
            Partial<EditContractRequest>,
            ContractResponse
        >(`/contracts/${params.id}`, {
            approval_file: params.approvalFile,
            spec_file: params.specFile,
            approval_memo: params.approvalMemo,
            next_action: params.nextAction || 'inquiry',
        });
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateInquiry(params: {
        id: number;
        approvalNumber: string;
        inquiryAt: Date;
        inquiryMemo: string;
        inquiryById: number;
        nextAction?: string;
    }): Promise<Contract> {
        const res = await getClient().patch<
            Partial<EditContractRequest>,
            ContractResponse
        >(`/contracts/${params.id}`, {
            approval_number: params.approvalNumber,
            inquiry_at: params.inquiryAt.toISOString(),
            inquiry_memo: params.inquiryMemo,
            inquiry_by_id: params.inquiryById,
            next_action: params.nextAction || 'agreement',
        });
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateAgreement(params: {
        id: number;
        constructionId?: number;
        designId?: number;
        contractNumber: string;
        contractAt: Date;
        contractedPrice: number;
        endAt: Date;
        memo: string;
        supplierId: number | null;
        bidMethod: string;
        designStaffId: number | null;
        designChiefId: number | null;
        constructionStaffId: number | null;
        constructionChiefId: number | null;
        nextAction: string;
    }): Promise<Contract> {
        const res = await getClient().patch<
            Partial<EditContractRequest>,
            ContractResponse
        >(`/contracts/${params.id}`, {
            contract_number: params.contractNumber,
            contract_at: params.contractAt.toISOString(),
            contracted_price: params.contractedPrice,
            end_at: params.endAt.toISOString(),
            memo: params.memo,
            supplier_id: params.supplierId,
            bid_method: params.bidMethod,
            design_staff_id: params.designStaffId,
            design_chief_id: params.designChiefId,
            construction_staff_id: params.constructionStaffId,
            construction_chief_id: params.constructionChiefId,
            next_action: params.nextAction,
        });
        return ContractFactory.createFromResponse(res.data);
    }

    static async findByConstruction(
        construction: Construction,
    ): Promise<Contract> {
        const res = await getClient().get<ContractResponse>(
            `/contracts?construction_id=${construction.id}`,
        );
        return ContractFactory.createFromResponse(res.data);
    }

    static async create({
        constructionId,
        designId,
        costDocument,
        expectedPrice,
        expectedPriceWithTax,
        contractNumber,
        startAt,
        supplierId,
        bidMethod,
        designChiefId,
        designStaffId,
        constructionChiefId,
        constructionStaffId,
        nextAction,
        manageSheet,
        approvalFile,
        approvalMemo,
        endAt,
        contractedPrice,
        isConstructionPeriodChanged,
        specFile,
    }: Partial<Contract>): Promise<Contract> {
        const contractableParams = constructionId
            ? { construction_id: constructionId }
            : { design_id: designId };
        const manageSheetParams = manageSheet
            ? {
                  manage_sheet: manageSheet,
              }
            : {};
        const designChiefIdParams = designChiefId
            ? { design_chief_id: designChiefId }
            : {};
        const designStaffIdParams = designStaffId
            ? { design_staff_id: designStaffId }
            : {};
        const constructionChiefIdParams = constructionChiefId
            ? { construction_chief_id: constructionChiefId }
            : {};
        const constructionStaffIdParams = constructionStaffId
            ? { construction_staff_id: constructionStaffId }
            : {};
        const contractNumberParams = contractNumber
            ? { contract_number: contractNumber }
            : {};
        const approvalMemoParams = approvalMemo
            ? { approval_memo: approvalMemo }
            : {};
        const specFileParams = specFile ? { 'spec_file': specFile } : {};
        const approvalFileParams = approvalFile
            ? { 'approval_file': approvalFile }
            : {};
        const res = await getClient().formPost<
            Partial<EditContractRequest>,
            ContractResponse
        >(`/contracts`, {
            ...contractableParams,
            ...manageSheetParams,
            ...designChiefIdParams,
            ...designStaffIdParams,
            ...constructionChiefIdParams,
            ...constructionStaffIdParams,
            ...contractNumberParams,
            ...approvalMemoParams,
            ...specFileParams,
            ...approvalFileParams,
            contracted_price: contractedPrice,
            cost_document: costDocument,
            end_at: endAt?.toISOString(),
            expected_price: expectedPrice,
            expected_price_with_tax: expectedPriceWithTax,
            start_at: startAt?.toISOString(),
            supplier_id: supplierId,
            bid_method: bidMethod,
            next_action: nextAction,
            is_construction_period_changed: isConstructionPeriodChanged,
        });
        return ContractFactory.createFromResponse(res.data);
    }

    static async updateStaff(
        id: number,
        staffInfo: {
            inquiryById?: number;
            designStaffId?: number;
            designChiefId?: number;
            constructionStaffId?: number;
            constructionChiefId?: number;
        },
    ): Promise<Contract> {
        const params: { [key: string]: number } = {};
        Object.entries(staffInfo).forEach(([k, v]) => {
            if (!v) return;
            params[snakeCase(k)] = v;
        });
        const res = await getClient().patch<typeof params, ContractResponse>(
            `/contracts/${id}`,
            params,
        );
        return ContractFactory.createFromResponse(res.data);
    }
}
