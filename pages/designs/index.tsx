import React, { useState, useEffect, useContext } from 'react';
import {
    Page,
    DesignActionButton,
    Tabs,
    SelectProjectModal,
    SearchModal,
    PagingButtons,
} from '@/Presentation/Component';
import { Design } from '@/Domain/Entity';
import Link from 'next/link';
import { Badge, Breadcrumb, Button, Table } from 'react-bootstrap';
import { DesignRepository } from '@/Domain/Repository';
import { useRouter } from 'next/router';
import { GetServerSideProps, NextPage } from 'next';
import { MasterContext } from '@/Presentation/Context';

interface Props {
    page: number;
    keyword: string;
    nextAction: string;
}

const Designs: NextPage<Props> = ({ page, keyword, nextAction }) => {
    const { users, suppliers } = useContext(MasterContext);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showSelectProjectModal, setShowSelectProjectModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        const result = await DesignRepository.search(keyword, nextAction, page);
        setDesigns(result.values);
        setTotalPages(result.totalPages || 1);
    };
    useEffect(() => {
        fetchData();
    }, [router.query]);

    const onSelectProject = (projectId: number) => {
        router.push(`/designs/new?project_id=${projectId}`);
    };

    const onChangePage = (newPage: number) => {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (nextAction) params.append('next_action', nextAction);
        params.append('page', newPage.toString());
        router.push(`/designs?${params.toString()}`);
    };

    const onSearch = async (keyword: string) => {
        setShowSearchModal(false);
        router.push(`/designs?keyword=${keyword}`);
    };

    const designRows = designs.map(d => {
        const contract = d.latestContract;

        return (
            <tr key={d.id}>
                <td>{d.documentNumber?.dividedHyphen}</td>
                <td>
                    {d.contracts.length > 1 && (
                        <Badge variant='info' className='mr-2'>
                            設計変更
                        </Badge>
                    )}
                    <Link
                        href='/designs/[id]/summary'
                        as={`/designs/${d.id}/summary`}
                    >
                        <a title={d.name}>{d.name}</a>
                    </Link>
                </td>
                <td>{d.latestContract.approvalNumber || '-'}</td>
                <td>
                    {d.latestContract.contractedPrice?.toLocaleString() || '-'}
                </td>
                <td>
                    {users.find(u => u.id === d.latestContract.designStaffId)
                        ?.name || '-'}
                </td>
                <td>{contract.endAt?.toLocaleDateString() || '-'}</td>
                <td>
                    {suppliers.find(s => s.id === d.latestContract.supplierId)
                        ?.name || '-'}
                </td>
                <td>
                    <DesignActionButton design={d} />
                </td>
            </tr>
        );
    });

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>設計一覧</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>設計一覧</h3>
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
                            href: '/designs',
                            isActive: url => !url.includes('next_action='),
                        },
                        {
                            text: '内訳明細書',
                            href: '/designs?next_action=upload_cost_document',
                            isActive: url =>
                                url.includes(
                                    'next_action=upload_cost_document',
                                ),
                        },
                        {
                            text: '仕様書・稟議',
                            href: '/designs?next_action=approval',
                            isActive: url =>
                                url.includes('next_action=approval'),
                        },
                        {
                            text: '契約伺い',
                            href: '/designs?next_action=inquiry',
                            isActive: url =>
                                url.includes('next_action=inquiry'),
                        },
                        {
                            text: '契約登録',
                            href: '/designs?next_action=agreement',
                            isActive: url =>
                                url.includes('next_action=agreement'),
                        },
                        {
                            text: '工事登録',
                            href: '/designs?next_action=construction',
                            isActive: url =>
                                url.includes('next_action=construction'),
                        },
                    ]}
                />
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '110px' }}>設計書番号</th>
                                <th style={{ width: '500px' }}>設計名称</th>
                                <th style={{ width: '120px' }}>稟議番号</th>
                                <th style={{ width: '155px' }}>
                                    契約金額（税込）
                                </th>
                                <th style={{ width: '124px' }}>担当者</th>
                                <th style={{ width: '110px' }}>設計完了日</th>
                                <th style={{ width: '160px' }}>設計業者</th>
                                <th style={{ width: '144px' }} />
                            </tr>
                        </thead>
                        <tbody>{designRows}</tbody>
                    </Table>
                </div>
                <PagingButtons
                    page={page}
                    totalPages={totalPages}
                    onChangePage={onChangePage}
                />
                <SelectProjectModal
                    show={showSelectProjectModal}
                    onSelectProject={onSelectProject}
                    onHide={() => setShowSelectProjectModal(false)}
                />
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

export default Designs;
