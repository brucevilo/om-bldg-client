import React, { useState, useEffect, useContext } from 'react';
import { Construction, ConstructionStatement } from '@/Domain/Entity';
import {
    ConstructionRepository,
    ConstructionStatementRepository,
} from '@/Domain/Repository';
import {
    Page,
    ConstructionActionButton,
    Tabs,
    SearchModal,
    PagingButtons,
} from '@/Presentation/Component';
import { Badge, Breadcrumb, Button, Table, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { MasterContext } from '@/Presentation/Context';
import { DateTime } from 'luxon';

interface Props {
    page: number;
    keyword: string;
    nextAction: string;
}

const Constructions: NextPage<Props> = ({ page, keyword, nextAction }) => {
    const [constructions, setConstructions] = useState<Construction[]>([]);
    const [constructionStatements, setConstructionStatements] = useState<
        ConstructionStatement[]
    >([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const { users, suppliers } = useContext(MasterContext);
    const router = useRouter();

    const fetchData = async () => {
        const result = await ConstructionRepository.search(
            keyword,
            nextAction,
            page,
        );
        const css = await ConstructionStatementRepository.listByConstructions(
            result.values.map(c => c.id as number),
        );
        setConstructions(result.values);
        setConstructionStatements(css);
        setTotalPages(result.totalPages || 1);
        setLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, [router.query]);

    const onChangePage = (newPage: number) => {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (nextAction) params.append('next_action', nextAction);
        params.append('page', newPage.toString());
        router.push(`/constructions?${params.toString()}`);
    };

    const onSearch = async (keyword: string) => {
        setShowSearchModal(false);
        router.push(`/constructions?keyword=${keyword}`);
    };

    const constructionRows = constructions.map(c => {
        return (
            <tr key={c.id}>
                <td>{c.documentNumber.dividedHyphen}</td>
                <td title={c.name}>
                    {c.contracts.length > 1 && (
                        <Badge variant='info' className='mr-2'>
                            設計変更
                        </Badge>
                    )}
                    {c.latestContract.nextAction === 'completed' ? (
                        <Badge variant='info' className='mr-2'>
                            工事完了
                        </Badge>
                    ) : (
                        constructionStatements.find(
                            cs =>
                                cs.contractId === c.latestContract.id &&
                                cs.isConstructionInProgressCompleted,
                        ) && (
                            <Badge variant='info' className='mr-2'>
                                一部完成
                            </Badge>
                        )
                    )}
                    <Link
                        href='/constructions/[id]/summary'
                        as={`/constructions/${c.id}/summary`}
                    >
                        {c.name}
                    </Link>
                </td>
                <td>{c.latestContract.approvalNumber || '-'}</td>
                <td>
                    {c.latestContract.contractedPrice?.toLocaleString() || '-'}
                </td>
                <td>
                    {users.find(
                        u => u.id === c.latestContract.constructionStaffId,
                    )?.name || '-'}
                </td>
                <td>
                    {c.latestContract.endAt
                        ? DateTime.fromJSDate(c.latestContract.endAt).toFormat(
                              'yyyy/MM/dd',
                          )
                        : '-'}
                </td>
                <td>
                    {suppliers.find(s => s.id === c.latestContract.supplierId)
                        ?.name || '-'}
                </td>
                <td className='text-right'>
                    <ConstructionActionButton construction={c} />
                </td>
            </tr>
        );
    });

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>工事一覧</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>工事一覧</h3>
                        <Button
                            variant='light'
                            className='bg-white border'
                            onClick={() => setShowSearchModal(true)}
                        >
                            詳細検索
                        </Button>
                    </div>
                </div>
                <Tabs
                    className='mb-4'
                    items={[
                        {
                            text: 'すべて',
                            href: '/constructions',
                            isActive: url => !url.includes('next_action='),
                        },
                        {
                            text: '内訳明細書',
                            href: '/constructions?next_action=upload_cost_document',
                            isActive: url =>
                                url.includes(
                                    'next_action=upload_cost_document',
                                ),
                        },
                        {
                            text: '設計・稟議',
                            href: '/constructions?next_action=approval',
                            isActive: url =>
                                url.includes('next_action=approval'),
                        },
                        {
                            text: '契約伺い',
                            href: '/constructions?next_action=inquiry',
                            isActive: url =>
                                url.includes('next_action=inquiry'),
                        },
                        {
                            text: '契約登録',
                            href: '/constructions?next_action=agreement',
                            isActive: url =>
                                url.includes('next_action=agreement'),
                        },
                        {
                            text: '建仮精算・除却',
                            href: '/constructions?next_action=retirement_and_construction_in_progress',
                            isActive: url =>
                                url.includes(
                                    'next_action=retirement_and_construction_in_progress',
                                ),
                        },
                        {
                            text: '工事完了',
                            href: '/constructions?next_action=completed',
                            isActive: url =>
                                url.includes('next_action=completed'),
                        },
                    ]}
                />
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '110px' }}>設計書番号</th>
                                <th style={{ width: '500px' }}>工事名称</th>
                                <th style={{ width: '100px' }}>稟議番号</th>
                                <th style={{ width: '160px' }}>
                                    契約金額（税込）
                                </th>
                                <th style={{ width: '124px' }}>工事担当者</th>
                                <th style={{ width: '110px' }}>工事工期</th>
                                <th style={{ width: '110px' }}>業者名</th>
                                <th style={{ width: '166px' }} />
                            </tr>
                        </thead>
                        {loading ? (
                            <tbody
                                className='text-center'
                                style={{
                                    backgroundColor: '#F5F5F5',
                                    position: 'absolute',
                                    marginBottom: '20px',
                                    top: '50%',
                                    right: '50%',
                                    left: '50%',
                                }}
                            >
                                <tr>
                                    <td>
                                        <Spinner
                                            animation='border'
                                            role='status'
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        ) : (
                            <tbody>{constructionRows}</tbody>
                        )}
                    </Table>
                </div>
                {!loading && (
                    <PagingButtons
                        page={page}
                        totalPages={totalPages}
                        onChangePage={onChangePage}
                    />
                )}
                <SearchModal
                    show={showSearchModal}
                    onHide={() => setShowSearchModal(false)}
                    onSearch={onSearch}
                />
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    query,
}) => {
    return {
        props: {
            page: query.page ? Number(query.page) : 1,
            keyword: query.keyword?.toString() || '',
            nextAction: query.next_action?.toString() || '',
        },
    };
};

export default Constructions;
