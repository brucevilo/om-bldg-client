import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
    Page,
    Breadcrumb,
    NotificationsTable,
    PagingButtons,
} from '@/Presentation/Component';
import { NotificationRepository } from '@/Domain/Repository';
import { Notification } from '@/Domain/Entity';

const Notifications: NextPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchData = async () => {
        const { values, totalPages } = await NotificationRepository.search(
            currentPage,
        );
        if (totalPages) setTotalPages(totalPages);
        setNotifications(values);
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);
    return (
        <Page>
            <section>
                <Breadcrumb
                    items={[
                        { text: 'ダッシュボード', href: '/' },
                        {
                            text: 'アクション履歴一覧',
                            href: '/notifications',
                            active: true,
                        },
                    ]}
                />
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h3 className='font-weight-bold'>アクション履歴一覧</h3>
                </div>
                <NotificationsTable notifications={notifications} />
                <div className='d-flex justify-content-between'>
                    <PagingButtons
                        page={currentPage}
                        totalPages={totalPages}
                        onChangePage={i => setCurrentPage(i)}
                    />
                </div>
            </section>
        </Page>
    );
};

export default Notifications;
