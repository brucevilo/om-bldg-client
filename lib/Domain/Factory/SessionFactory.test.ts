import { SessionResponseObject, SessionFactory } from '.';

test('レスポンスからSessionを作成', () => {
    const res: SessionResponseObject = {
        id: 1,
        user: {
            id: 2,
            email: 'test@example.com',
            name: 'テストユーザー',
            department: '部署',
            name_code: '11111',
            admin: true,
            created_at: new Date('2020-01-01').toISOString(),
            updated_at: new Date('2020-01-05').toISOString(),
        },
        token: 'xxx',
        created_at: new Date('2020-01-02').toISOString(),
        updated_at: new Date('2020-01-06').toISOString(),
    };
    const session = SessionFactory.createFromResponseObject(res);

    expect(session.id).toBe(res.id);
    expect(session.user.id).toBe(res.user.id);
    expect(session.user.email).toBe(res.user.email);
    expect(session.user.createdAt.toISOString()).toBe(res.user.created_at);
    expect(session.user.updatedAt.toISOString()).toBe(res.user.updated_at);
    expect(session.token).toBe(res.token);
    expect(session.createdAt.toISOString()).toBe(res.created_at);
    expect(session.updatedAt.toISOString()).toBe(res.updated_at);
});
