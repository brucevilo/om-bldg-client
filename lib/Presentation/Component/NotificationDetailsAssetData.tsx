import { Notification, SapFixedAsset } from '@/Domain/Entity';
import { SapFixedAssetRepository } from '@/Domain/Repository';
import { DateTime } from 'luxon';
import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';

interface Props {
    notification: Notification;
    id: number;
}

const NotificationDetailsAssetData: FC<Props> = props => {
    const [asset, setAsset] = useState<SapFixedAsset>();
    const fetchData = async () => {
        setAsset(await SapFixedAssetRepository.get(props.id));
    };
    useEffect(() => {
        fetchData();
    }, []);
    if (!asset) return null;
    return (
        <>
            <div className='mb-4'>
                <h2 className='font-weight-bold h5 mb-4'>資産明細</h2>
                <Link href={`/assets/${props.id}/checklist?status=checked`}>
                    <a>
                        <p className='ml-2 mb-0'>{asset?.assetName}</p>
                    </a>
                </Link>
                <hr className='mt-1 ml-2' />
            </div>
            <div className='mb-4 mt-4'>
                <p className='mb-0'>
                    現物照合日時：
                    {DateTime.fromJSDate(
                        asset?.assetChecklists[0].createdAt,
                    ).toFormat('yyyy/MM/dd')}
                </p>
                <hr className='mt-0' />
                <p className='mb-0'>
                    現物照合担当者：{props.notification.user.name}
                </p>
                <hr className='mt-0' />
            </div>
        </>
    );
};

export default NotificationDetailsAssetData;
