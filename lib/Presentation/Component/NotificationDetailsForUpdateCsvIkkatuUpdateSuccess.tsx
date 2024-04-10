import React, { FC } from 'react';
import { Notification, UpdateCsvIkkatuUploadData } from '@/Domain/Entity';
import { useCsvIkkatuUpdateNotidication } from '@/App/Hook/useCsvIkkatuUpdateNotification';

interface Props {
    notification: Notification;
}

export const NotificationDetailsForCsvIkkatuUploadSuccess: FC<Props> = (
    props: Props,
) => {
    const { notification } = props;
    const data = notification.data as UpdateCsvIkkatuUploadData;

    const { construction, constructionStatement, retirement } =
        useCsvIkkatuUpdateNotidication(data);

    if (!retirement) return null;
    return (
        <>
            <div className='mb-4'>
                <p className='mb-0'>【対象工事】</p>
                <p>
                    工事名：
                    {construction ? construction.name : ''}
                </p>
                <p className='mb-0'>【対象工事明細】</p>
                <p>
                    工事明細名：
                    {constructionStatement?.name || '該当明細なし'}
                </p>
            </div>
            <p>
                ダウンロードは
                <a
                    href={
                        process.env.NEXT_PUBLIC_API_ORIGIN +
                        (retirement?.csvIkkatuUploadInfo?.path || '')
                    }
                >
                    こちら
                </a>
            </p>
        </>
    );
};
