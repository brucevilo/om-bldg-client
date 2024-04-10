import React, { FC } from 'react';
import {
    Notification,
    UpdateDesignManageSheetErrorData,
} from '@/Domain/Entity';
import { DateTime } from 'luxon';
import { ManageSheetService } from '@/App/Service';
import { convertEasyToUnderstandFromNotificationDataErrorCase } from '@/App/Service/NotificationService';

interface Props {
    notification: Notification;
}

export const NotificationDetailsForUpdateDesignManageSheetError: FC<Props> = (
    props: Props,
) => {
    const { notification } = props;
    const data = notification.data as UpdateDesignManageSheetErrorData;
    if (!data) return null;
    return (
        <>
            <h1 className='font-weight-bold h4 mb-4'>{notification.text}</h1>
            <time className='mb-4 d-block'>
                {DateTime.fromJSDate(notification.createdAt).toFormat(
                    'yyyy年MM月dd日 HH:mm',
                )}
            </time>
            <div className='mb-4'>
                <h2 className='h5 mb-3'>【対象設計】</h2>
                <p className='mb-0'>設計ID：{data?.designId}</p>
                <p>設計名：{data?.designName}</p>
            </div>
            <div className='mb-4'>
                <h2 className='h5 mb-3'>【エラー内容】</h2>
                <p>
                    {convertEasyToUnderstandFromNotificationDataErrorCase(
                        data.errorCase || '',
                    )}
                </p>
            </div>
            <div className='mb-4'>
                <h2 className='h5 mb-3'>【タイミング】</h2>
                <p>{ManageSheetService.stageToText(data.stage)}</p>
            </div>
            <p>
                上記を確認・再アップロードの上、それでも編集がうまく行かない場合は、お手数ですが社内担当者にお問い合わせください。
            </p>
        </>
    );
};
