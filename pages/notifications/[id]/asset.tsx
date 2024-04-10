import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, Breadcrumb } from '@/Presentation/Component';
import { Notification } from '@/Domain/Entity';
import { NotificationRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { DateTime } from 'luxon';
import NotificationDetailsAssetData from '@/Presentation/Component/NotificationDetailsAssetData';
import { UpdateCsvIkkatuUploadData } from '@/Domain/Entity/Notification';

interface Props {
    id: number;
}

const Asset: NextPage<Props> = ({ id }) => {
    const [notification, setNotification] = useState<Notification>();

    const fetchData = async () => {
        setNotification(await NotificationRepository.get(id));
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!notification) return null;
    const assetId = (notification?.data as UpdateCsvIkkatuUploadData)
        .retirementId;
    return (
        <Page>
            <section>
                <Breadcrumb
                    items={[
                        { text: 'ダッシュボード', href: '/' },
                        { text: 'アクション履歴一覧', href: '/notifications' },
                        {
                            text: notification.text,
                            href: '/notifications/[id]',
                            as: `/notifications/${id}`,
                            active: true,
                        },
                    ]}
                />
                <article className='bg-white p-4'>
                    <Link href='/notifications'>
                        <a className='text-decoration-none mb-4 d-block'>
                            <FA icon={faAngleLeft} className='mr-2' />
                            アクション履歴一覧に戻る
                        </a>
                    </Link>
                    <h1 className='font-weight-bold h4 mb-4'>
                        今期の現物照合が完了しました。
                    </h1>
                    <time className='mb-4 d-block'>
                        {DateTime.fromJSDate(notification.createdAt).toFormat(
                            'yyyy年MM月dd日 HH:mm',
                        )}
                    </time>
                    <NotificationDetailsAssetData
                        notification={notification}
                        id={assetId}
                    />
                </article>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            id: Number(params?.id),
        },
    };
};

export default Asset;
