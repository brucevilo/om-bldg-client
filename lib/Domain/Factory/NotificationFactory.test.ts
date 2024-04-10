import {
    NotificationFactory,
    NotificationResponse,
    NotificationResponseData,
} from './';
import { Kind, UpdateManageSheetErrorData } from '../Entity';

test('レスポンスから通知を作成 工事管理シート編集成功', () => {
    const res: NotificationResponse = {
        id: 1,
        text: '中ふ頭外２駅トイレ改造その他工事　success',
        link: 'test@example.com',
        kind: Kind.UpdateManageSheet,
        data: null,
        user: {
            id: 1,
            email: 'test@example.com',
            name: 'テスト',
            name_code: '111111',
            department: '部署',
            admin: true,
            'created_at': new Date('2020-01-01').toISOString(),
            'updated_at': new Date('2020-01-05').toISOString(),
        },
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };
    const notification = NotificationFactory.createFromResponse(res);

    expect(notification.id).toBe(res.id);
    expect(notification.text).toBe(res.text);
    expect(notification.link).toBe(res.link);
    expect(notification.kind).toBe(res.kind);
    expect(notification.data).toBeNull();
    expect(notification.user.id).toBe(res.user.id);
    expect(notification.createdAt.toISOString()).toBe(res.created_at);
    expect(notification.updatedAt.toISOString()).toBe(res.updated_at);
});

test('レスポンスから通知を作成 工事管理シート編集失敗', () => {
    const res: NotificationResponse = {
        id: 1,
        text: '中ふ頭外２駅トイレ改造その他工事　failure',
        link: 'test@example.com',
        kind: Kind.UpdateManageSheetError,
        data: {
            construction_id: 1,
            construction_name: '中ふ頭外２駅トイレ改造その他工事',
            error_case: '別のファイルをアップロードしている可能性があります。',
        } as NotificationResponseData,
        user: {
            id: 1,
            email: 'test@example.com',
            name: 'テスト',
            name_code: '111111',
            department: '部署',
            admin: true,
            'created_at': new Date('2020-01-01').toISOString(),
            'updated_at': new Date('2020-01-05').toISOString(),
        },
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };

    const notification = NotificationFactory.createFromResponse(res);
    const data = notification.data as UpdateManageSheetErrorData;
    expect(notification.id).toBe(res.id);
    expect(notification.text).toBe(res.text);
    expect(notification.link).toBe(res.link);
    expect(notification.kind).toBe(res.kind);
    expect(data.errorCase).toBe(res.data?.error_case);
    expect(data.constructionName).toBe(res.data?.construction_name);
    expect(data.constructionId).toBe(res.data?.construction_id);
    expect(notification.user.id).toBe(res.user.id);
    expect(notification.createdAt.toISOString()).toBe(res.created_at);
    expect(notification.updatedAt.toISOString()).toBe(res.updated_at);
});
