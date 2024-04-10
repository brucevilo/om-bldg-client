import { ContractFactory, ContractResponse } from './ContractFactory';

test('レスポンスからインスタンスを作成', () => {
    const res: ContractResponse = {
        id: 1,
        'contract_number': 'contractnumber',
        spec_file_info: null,
        cost_document_info: null,
        estimation_sheet_info: null,
        manage_sheet_info: null,
        'approval_number': 'xxx',
        'approval_file_info': {
            path: '/hoge',
            filename: 'xxx.xslx',
        },
        approval_memo: 'approval memo',
        sap_record_import_manage_sheet_info: {
            path: '/hoge',
            filename: 'xxx.xslx',
        },
        'design_id': 1,
        'construction_id': 2,
        request_memo: 'request memo',
        expected_price: 500,
        expected_price_with_tax: 550,
        'contracted_price': 500,
        'contract_at': new Date().toISOString(),
        memo: 'memo',
        inquiry_at: new Date().toISOString(),
        inquiry_file_info: null,
        inquiry_memo: 'inquiry memo',
        expected_construction_order_date_when_designing:
            new Date().toISOString(),
        scheduled_acceptance_date: new Date().toISOString(),
        expected_start_at: new Date().toISOString(),
        expected_end_at: new Date().toISOString(),
        start_at: new Date().toISOString(),
        end_at: new Date().toISOString(),
        next_action: 'agreement',
        supplier_id: 11,
        bid_method: '競争入札',
        inquiry_by_id: 1,
        design_staff_id: 2,
        design_chief_id: 3,
        construction_staff_id: 4,
        construction_chief_id: 5,
        completed_by_id: 6,
        owner_id: 1,
        completed_at: new Date().toISOString(),
        'created_at': new Date().toISOString(),
        'updated_at': new Date().toISOString(),
        is_construction_period_changed: false,
        construction_statements: [],
        is_processing: false,
    };
    const contract = ContractFactory.createFromResponse(res);
    expect(contract.id).toBe(res.id);
    expect(contract.contractNumber).toBe(res.contract_number);
    expect(contract.specFileInfo).toBeNull();
    expect(contract.costDocumentInfo).toBeNull();
    expect(contract.manageSheetInfo).toBeNull();
    expect(contract.approvalNumber).toBe(res.approval_number);
    expect(contract.approvalFileInfo?.path).toBe(res.approval_file_info?.path);
    expect(contract.approvalMemo).toBe(res.approval_memo);
    expect(contract.sapRecordImportManageSheetInfo?.path).toBe(
        res.sap_record_import_manage_sheet_info?.path,
    );
    expect(contract.designId).toBe(1);
    expect(contract.constructionId).toBe(2);
    expect(contract.requestMemo).toBe(res.request_memo);
    expect(contract.contractedPrice).toBe(res.contracted_price);
    expect(contract.contractAt?.toISOString()).toBe(res.contract_at);
    expect(contract.memo).toBe(res.memo);
    expect(contract.inquiryAt?.toISOString()).toBe(res.inquiry_at);
    expect(contract.inquiryFileInfo).toBeNull();
    expect(contract.scheduledAcceptanceDate?.toISOString()).toBe(
        res.scheduled_acceptance_date,
    );
    expect(contract.expectedStartAt?.toISOString()).toBe(res.expected_start_at);
    expect(contract.expectedEndAt?.toISOString()).toBe(res.expected_end_at);
    expect(contract.startAt?.toISOString()).toBe(res.start_at);
    expect(contract.endAt?.toISOString()).toBe(res.end_at);
    expect(contract.nextAction).toBe('agreement');
    expect(contract.supplierId).toBe(res.supplier_id);
    expect(contract.bidMethod).toBe(res.bid_method);
    expect(contract.inquiryById).toBe(res.inquiry_by_id);
    expect(contract.designStaffId).toBe(res.design_staff_id);
    expect(contract.designChiefId).toBe(res.design_chief_id);
    expect(contract.constructionStaffId).toBe(res.construction_staff_id);
    expect(contract.constructionChiefId).toBe(res.construction_chief_id);
    expect(contract.completedById).toBe(res.completed_by_id);
    expect(contract.completedAt?.toISOString()).toBe(res.completed_at);
    expect(contract.createdAt.toISOString()).toBe(res.created_at);
    expect(contract.updatedAt.toISOString()).toBe(res.updated_at);
    expect(contract.expectedPrice).toBe(res.expected_price);
    expect(contract.expectedPriceWithTax).toBe(res.expected_price_with_tax);
    expect(contract.isProcessing).toBeFalsy();
});
