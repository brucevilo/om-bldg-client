import { AttachmentInfo } from '../ValueObject';
import {
    ConstructionStatementHistoryFactory,
    ConstructionStatementHistoryResponse,
} from './ConstructionStatementHistoryFactory';

test('Create csHistory from response', () => {
    const res: ConstructionStatementHistoryResponse = {
        id: 1,
        asset_difference: 10000,
        construction_statement_id: 1,
        removal_fee_difference: 10000,
        repair_fee_difference: 10000,
        partial_payment: 10000,
        partial_payment_acceptance_date: new Date().toISOString(),
        is_draft: false,
        reason_for_change: 'sample',
        construction_period: new Date().toISOString(),
        scheduled_acceptance_date: new Date().toISOString(),
        file_info: {
            path: '/project_file',
            filename: 'xxx.pdf',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const csHistory =
        ConstructionStatementHistoryFactory.createFromResponse(res);
    expect(csHistory.id).toBe(res.id);
    expect(csHistory.assetDifference).toBe(res.asset_difference);
    expect(csHistory.constructionStatementId).toBe(
        res.construction_statement_id,
    );
    expect(csHistory.removalFeeDifference).toBe(res.removal_fee_difference);
    expect(csHistory.repairFeeDifference).toBe(res.repair_fee_difference);
    expect(csHistory.partialPayment).toBe(res.partial_payment);
    expect(csHistory.isDraft).toBe(res.is_draft);
    expect(csHistory.reasonForChange).toBe(res.reason_for_change);
    expect(csHistory.partialPaymentAcceptanceDate?.toISOString()).toBe(
        res.partial_payment_acceptance_date,
    );
    expect(csHistory.constructionPeriod?.toISOString()).toBe(
        res.construction_period,
    );
    expect(csHistory.scheduledAcceptanceDate?.toISOString()).toBe(
        res.scheduled_acceptance_date,
    );
    expect((csHistory.fileInfo as AttachmentInfo)?.path).toBe(
        res.file_info?.path,
    );
    expect((csHistory.fileInfo as AttachmentInfo)?.filename).toBe(
        res.file_info?.filename,
    );
    expect(csHistory.createdAt.toISOString()).toBe(res.created_at);
    expect(csHistory.updatedAt.toISOString()).toBe(res.updated_at);
});
