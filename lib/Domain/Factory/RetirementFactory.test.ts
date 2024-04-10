import { RetirementFactory, RetirementResponse } from './';
import { dummyRetirementCostItemResponse } from '@/__test__/dummy';

it('create from response', () => {
    const res: RetirementResponse = {
        id: 1,
        construction_statement_id: 1,
        retirement_cost_items: [dummyRetirementCostItemResponse()],
        retiremented_at: new Date('2020-01-01').toISOString(),
        construction_id: 1,
        csv_ikkatu_upload_info: {
            path: '/hoge',
            filename: 'xxx.xslx',
        },
        created_at: new Date('2020-01-01').toISOString(),
        updated_at: new Date('2020-10-10').toISOString(),
    };
    const retirement = RetirementFactory.createFromResponseObject(res);
    expect(retirement.id).toBe(res.id);
    expect(retirement.constructionStatementId).toBe(
        res.construction_statement_id,
    );
    expect(retirement.retirementCostItems[0].id).toBe(
        res.retirement_cost_items[0]['id'],
    );
    expect(retirement.retirementedAt.toISOString()).toBe(res.retiremented_at);
    expect(retirement.constructionId).toBe(res.construction_id);
    expect(retirement.csvIkkatuUploadInfo?.path).toBe(
        res.csv_ikkatu_upload_info?.path,
    );
    expect(retirement.createdAt.toISOString()).toBe(res.created_at);
    expect(retirement.updatedAt.toISOString()).toBe(res.updated_at);
});
