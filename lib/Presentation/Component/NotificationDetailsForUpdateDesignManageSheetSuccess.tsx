import React, { FC, useState, useEffect } from 'react';
import {
    Notification,
    Design,
    UpdateDesignManageSheetData,
} from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';
import { ManageSheetService } from '@/App/Service';

interface Props {
    notification: Notification;
}

export const NotificationDetailsForUpdateDesignManageSheetSuccess: FC<Props> = (
    props: Props,
) => {
    const { notification } = props;
    const data = notification.data as UpdateDesignManageSheetData;
    const [design, setDesign] = useState<Design>();

    if (!data?.designId) return null;
    const fetchData = async () => {
        setDesign(await DesignRepository.get(data?.designId));
    };
    useEffect(() => {
        fetchData();
    }, []);

    if (!design) return null;
    return (
        <>
            <div className='mb-4'>
                <p className='mb-0'>【対象設計】</p>
                <p className='mb-0'>設計ID：{design.id}</p>
                <p>設計名：{design.name}</p>
                <p>タイミング: {ManageSheetService.stageToText(data.stage)}</p>
            </div>
            <p>
                ダウンロードは
                <a
                    href={
                        process.env.NEXT_PUBLIC_API_ORIGIN +
                        (design.latestContract?.manageSheetInfo?.path || '')
                    }
                >
                    こちら
                </a>
            </p>
        </>
    );
};
