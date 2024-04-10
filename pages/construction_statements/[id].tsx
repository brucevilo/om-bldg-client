import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Button, Card } from 'react-bootstrap';
import { ConstructionStatement } from '@/Domain/Entity';
import { ConstructionStatementRepository } from '@/Domain/Repository';
import {
    ConstructionStatementHistoriesDetail,
    Page,
} from '@/Presentation/Component';
import Styles from '@/Presentation/Style/Components/ConstructionStatementsDetailPage.module.scss';

interface Props {
    id: number;
}

const ConstructionStatementDetails: NextPage<Props> = props => {
    const [constructionStatement, setConstructionStatement] =
        useState<ConstructionStatement | null>(null);
    const router = useRouter();

    const fetchData = async () => {
        await ConstructionStatementRepository.get(props.id).then(
            setConstructionStatement,
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!constructionStatement) return null;

    const expectedPrice = constructionStatement.contract?.expectedPrice || 0;

    return (
        <Page>
            <div
                className={`${Styles.headers} bg-white px-5 py-2 border-bottom`}
            >
                <FA
                    icon={faArrowLeft}
                    className='mr-3'
                    role='button'
                    onClick={() =>
                        router.push(
                            `/constructions/${constructionStatement.contract?.constructionId}/summary`,
                        )
                    }
                />
                {constructionStatement.contract?.construction?.name || ''}
            </div>
            <div className='px-5 py-3'>
                <div className={`${Styles.headers} my-2`}>基本情報</div>
                <Card className='d-flex flex-row justify-content-between align-items-center p-2'>
                    <div>
                        {constructionStatement.name}
                        <div>
                            <span className={Styles.cs_detail}>
                                金額：¥
                                {expectedPrice.toLocaleString()}
                            </span>
                            <span className={Styles.cs_detail}>
                                工事工期：
                                {DateTime.fromJSDate(
                                    constructionStatement.term,
                                ).toFormat('yyyy/MM/dd')}
                            </span>
                            <span className={Styles.cs_detail}>
                                検収予定日：
                                {constructionStatement.scheduledAcceptanceDate
                                    ? DateTime.fromJSDate(
                                          constructionStatement.scheduledAcceptanceDate,
                                      ).toFormat('yyyy/MM/dd')
                                    : '-'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <Button
                            className={`${Styles.action_toggler} btn-outline-secondary`}
                            variant='light'
                            onClick={() => router.push('/change_schedule')}
                        >
                            変更予定
                        </Button>
                    </div>
                </Card>
                <div className={`${Styles.headers} my-4`}>変更履歴</div>
                <ConstructionStatementHistoriesDetail
                    csHistories={
                        constructionStatement.constructionStatementHistories
                    }
                />
            </div>
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

export default ConstructionStatementDetails;
