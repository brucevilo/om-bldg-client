import { UserFactory, UserResponseObject } from '.';

test('レスポンスからユーザを作成', () => {
    const res: UserResponseObject = {
        id: 1,
        email: 'test@example.com',
        name: 'テストユーザー',
        department: '部署',
        name_code: '11111',
        admin: true,
        created_at: new Date('2020-01-01').toISOString(),
        updated_at: new Date('2020-01-05').toISOString(),
    };

    const user = UserFactory.createFromResponseObject(res);
    expect(user.id).toBe(res.id);
    expect(user.email).toBe(res.email);
    expect(user.createdAt.toISOString()).toBe(res.created_at);
    expect(user.updatedAt.toISOString()).toBe(res.updated_at);
});
