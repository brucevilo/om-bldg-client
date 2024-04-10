import React, { FC } from 'react';
import NLink from 'next/link';
import { Table, Badge } from 'react-bootstrap';
import { Notification, Kind } from '@/Domain/Entity';
import { DateTime } from 'luxon';

type Props = {
    notifications: Notification[];
};

export const NotificationsTable: FC<Props> = ({ notifications }) => {
    return (
        <div className='table-responsive'>
            <Table hover>
                <thead>
                    <tr>
                        <th style={{ width: '200px' }}>日付</th>
                        <th style={{ width: '500px' }}>内容</th>
                        <th style={{ width: '200px' }}>ユーザー</th>
                    </tr>
                </thead>
                <tbody>
                    {notifications
                        .sort((a, b) => b.id - a.id)
                        .map(notification => (
                            <tr key={notification.id}>
                                <td
                                    title={DateTime.fromJSDate(
                                        notification.updatedAt,
                                    ).toFormat('yyyy/MM/dd HH:mm')}
                                >
                                    {DateTime.fromJSDate(
                                        notification.updatedAt,
                                    ).toFormat('yyyy/MM/dd HH:mm')}
                                </td>
                                <td title={notification.text}>
                                    {notification.kind ===
                                        Kind.UpdateManageSheetError ||
                                    notification.kind ===
                                        Kind.UpdateDesignManageSheetError ||
                                    notification.kind ===
                                        Kind.UpdateCsvIkkatuUploadError ? (
                                        <Badge
                                            className='mr-2'
                                            variant='danger'
                                        >
                                            エラー
                                        </Badge>
                                    ) : null}
                                    <NLink href={notification.link}>
                                        {notification.text}
                                    </NLink>
                                </td>
                                <td>
                                    <u>{notification.user.name}</u>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        </div>
    );
};
