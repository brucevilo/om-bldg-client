import { CIPResponse, CIPFactory } from './CIPFactory';

test('create', () => {
    const res: CIPResponse = {
        id: 1,
        handover_document_info: {
            path: '/hoge',
            filename: 'handover_document.txt',
        },
        memo: 'memo',
        created_at: new Date('2020-11-11').toISOString(),
        updated_at: new Date('2020-11-12').toISOString(),
    };

    const cip = CIPFactory.createFromResponse(res);
    expect(cip.id).toBe(res.id);
    expect(cip.handoverDocumentInfo?.path).toBe(
        res.handover_document_info?.path,
    );
    expect(cip.handoverDocumentInfo?.filename).toBe(
        res.handover_document_info?.filename,
    );
    expect(cip.memo).toBe(res.memo);
    expect(cip.createdAt.toISOString()).toBe(res.created_at);
    expect(cip.updatedAt.toISOString()).toBe(res.updated_at);
});
