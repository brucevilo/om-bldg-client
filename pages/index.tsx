import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
    Page,
    Breadcrumb,
    Tabs,
    ConstructionInProgress,
    NotificationsTable,
} from '@/Presentation/Component';
import NLink from 'next/link';
import { Notification } from '@/Domain/Entity';
import { Construction } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import { NotificationRepository } from '@/Domain/Repository';

type TabType = '状況' | 'アクション履歴' | '今月の完成予定工事';

const Index: NextPage = () => {
    const [activeTab, setActiveTab] = useState<TabType>('状況');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [constructions, setConstructions] = useState<Construction[]>([]);

    const fetchData = async () => {
        const constructionsByCurrentMonth =
            await ConstructionRepository.mgetByContractsAndConstructionStatement();

        setConstructions(constructionsByCurrentMonth);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const displayComponent = () => {
        switch (activeTab) {
            case '状況':
                return <>状況</>;
            case 'アクション履歴':
                return <NotificationsTable notifications={notifications} />;
            case '今月の完成予定工事':
                return <ConstructionInProgress constructions={constructions} />;
            default:
                return 'Error';
        }
    };

    const fetchNotifications = async () => {
        setNotifications(await NotificationRepository.index());
    };

    useEffect(() => {
        if (activeTab === 'アクション履歴') {
            fetchNotifications();
        }
    }, [activeTab]);

    return (
        <Page>
            <section>
                <Breadcrumb
                    items={[
                        { text: 'ダッシュボード', href: '/', active: true },
                    ]}
                />
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h3 className='font-weight-bold'>ダッシュボード</h3>
                </div>
                <div className='d-flex justify-content-between mb-4'>
                    <Tabs
                        items={[
                            {
                                text: '状況',
                                href: '',
                                isActive: () => activeTab === '状況',
                                onChangeTabs: () => setActiveTab('状況'),
                            },
                            {
                                text: 'アクション履歴',
                                href: '',
                                isActive: () => activeTab === 'アクション履歴',
                                onChangeTabs: () =>
                                    setActiveTab('アクション履歴'),
                            },
                            {
                                text: '今月の完成予定工事',
                                href: '',
                                isActive: () =>
                                    activeTab === '今月の完成予定工事',
                                onChangeTabs: () =>
                                    setActiveTab('今月の完成予定工事'),
                            },
                        ]}
                    />
                    <NLink href='/notifications'>
                        <a
                            className='text-decoration-none align-self-center'
                            hidden={activeTab !== 'アクション履歴'}
                        >
                            一覧を閲覧する
                        </a>
                    </NLink>
                </div>
                {displayComponent()}
            </section>
        </Page>
    );
};

export default Index;
