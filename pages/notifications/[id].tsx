import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    Breadcrumb,
    NotificationDetailsForUpdateManageSheetError,
    NotificationDetailsForUpdateManageSheetSuccess,
    NotificationDetailsForCsvIkkatuUploadSuccess,
    NotificationDetailsForCsvIkkatuUploadError,
    NotificationDetailsForUpdateDesignManageSheetSuccess,
    NotificationDetailsForUpdateDesignManageSheetError,
} from '@/Presentation/Component';
import { Notification, Kind } from '@/Domain/Entity';
import { NotificationRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface Props {
    id: number;
}

const NotificationsDetails: NextPage<Props> = ({ id }) => {
    const [notification, setNotification] = useState<Notification>();

    const fetchData = async () => {
        setNotification(await NotificationRepository.get(id));
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!notification) return null;

    const NotificationDetailsContents = () => {
        if (notification.kind === Kind.UpdateManageSheetError) {
            return (
                <NotificationDetailsForUpdateManageSheetError
                    notification={notification}
                />
            );
        } else if (notification.kind === Kind.UpdateManageSheet) {
            return (
                <NotificationDetailsForUpdateManageSheetSuccess
                    notification={notification}
                />
            );
        } else if (notification.kind === Kind.UpdateCsvIkkatuUpload) {
            return (
                <NotificationDetailsForCsvIkkatuUploadSuccess
                    notification={notification}
                />
            );
        } else if (notification.kind === Kind.UpdateCsvIkkatuUploadError) {
            return (
                <NotificationDetailsForCsvIkkatuUploadError
                    notification={notification}
                />
            );
        } else if (notification.kind === Kind.UpdateDesignManageSheet) {
            return (
                <NotificationDetailsForUpdateDesignManageSheetSuccess
                    notification={notification}
                />
            );
        } else if (notification.kind === Kind.UpdateDesignManageSheetError) {
            return (
                <NotificationDetailsForUpdateDesignManageSheetError
                    notification={notification}
                />
            );
        } else {
            return <p>このお知らせの詳細はありません</p>;
        }
    };

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
                    <NotificationDetailsContents />
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

export default NotificationsDetails;
