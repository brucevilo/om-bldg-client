import React, { FC, useEffect, useState } from 'react';
import {
    Notification,
    UpdateCsvIkkatuUploadErrorData,
    Construction,
    ConstructionStatement,
} from '@/Domain/Entity';
import {
    ConstructionStatementRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import { DateTime } from 'luxon';
import { convertEasyToUnderstandFromNotificationDataErrorCase } from '@/App/Service/NotificationService';

interface Props {
    notification: Notification;
}

export const NotificationDetailsForCsvIkkatuUploadError: FC<Props> = (
    props: Props,
) => {
    const [constructionStatement, setConstructionStatement] =
        useState<ConstructionStatement>();
    const [construction, setConstruction] = useState<Construction>();

    const { notification } = props;

    const data = notification.data as UpdateCsvIkkatuUploadErrorData;
    const fetchData = async () => {
        setConstruction(await ConstructionRepository.get(data.constructionId));
        setConstructionStatement(
            await ConstructionStatementRepository.get(
                data.constructionStatementId,
            ),
        );
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <h1 className='font-weight-bold h4 mb-4'>{notification.text}</h1>
            <time className='mb-4 d-block'>
                {DateTime.fromJSDate(notification.createdAt).toFormat(
                    'yyyy年MM月dd日 HH:mm',
                )}
            </time>
            <div className='mb-4'>
                <h2 className='h5 mb-3'>【対象工事】</h2>
                <p className='mb-0'>工事ID：{construction?.id}</p>
                <p>工事名：{construction?.name}</p>
            </div>
            <div className='mb-4'>
                <h2 className='h5 mb-3'>【対象工事明細】</h2>
                <p>
                    工事明細名：
                    {constructionStatement
                        ? constructionStatement.name
                        : '該当明細なし'}
                </p>
            </div>
            <div className='mb-4'>
                <h2 className='h5 mb-3'>【エラー内容】</h2>
                <p>
                    {convertEasyToUnderstandFromNotificationDataErrorCase(
                        data.errorCase || '',
                    )}
                </p>
            </div>
        </>
    );
};
