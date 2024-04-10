import React, { FC, useState, useEffect } from 'react';
import {
    Notification,
    Construction,
    UpdateManageSheetData,
} from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import { ManageSheetService } from '@/App/Service';

interface Props {
    notification: Notification;
}

export const NotificationDetailsForUpdateManageSheetSuccess: FC<Props> = (
    props: Props,
) => {
    const { notification } = props;
    const data = notification.data as UpdateManageSheetData;
    const [construction, setConstruction] = useState<Construction>();

    if (!data?.constructionId) return null;
    const fetchData = async () => {
        setConstruction(await ConstructionRepository.get(data?.constructionId));
    };
    useEffect(() => {
        fetchData();
    }, []);

    if (!construction) return null;
    return (
        <>
            <div className='mb-4'>
                <p className='mb-0'>【対象工事】</p>
                <p className='mb-0'>工事ID：{data?.constructionId}</p>
                <p>工事名：{data?.constructionName}</p>
                <p>タイミング: {ManageSheetService.stageToText(data.stage)}</p>
            </div>
            <p>
                ダウンロードは
                <a
                    href={
                        process.env.NEXT_PUBLIC_API_ORIGIN +
                        (construction.latestContract?.manageSheetInfo?.path ||
                            '')
                    }
                >
                    こちら
                </a>
            </p>
        </>
    );
};
