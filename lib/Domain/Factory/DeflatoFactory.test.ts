import { DeflatorFactory, DeflatorResponse } from '.';

test('レスポンスからDeflateを作成', () => {
    const res: DeflatorResponse = {
        id: 1,
        year: 1956,
        rate: 20.0,
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };

    const deflator = DeflatorFactory.createFromResponse(res);
    expect(deflator.id).toBe(res.id);
    expect(deflator.year).toBe(res.year);
    expect(deflator.rate).toBe(res.rate);
    expect(deflator.createdAt.toISOString()).toBe(res.created_at);
    expect(deflator.updatedAt.toISOString()).toBe(res.updated_at);
});
