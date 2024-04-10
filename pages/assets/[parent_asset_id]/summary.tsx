import React, { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
    ActionHistoryList,
    AssetDetailTabs,
    Breadcrumb,
    Page,
} from '@/Presentation/Component';
import {
    ActionHistory,
    Construction,
    Design,
    Project,
    SapFixedAsset,
    User,
} from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
    DesignRepository,
    ProjectRepository,
    SapFixedAssetRepository,
    UserRepository,
} from '@/Domain/Repository';
import { Col, Dropdown, Row, Table, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { assertsIsExists } from '@/Infrastructure';
import Link from 'next/link';

interface Props {
    sapFixedAssetId: number;
}

interface State {
    sapFixedAsset: SapFixedAsset;
    users: User[];
    actionHistories: ActionHistory[];
    projects?: Project[];
    construction?: Construction;
    designs?: Design[];
}

const useParentAssetSummaryState = (id: number) => {
    const [state, setState] = useState<State>();

    const fetchData = async () => {
        const users = await UserRepository.list();
        const sapFixedAsset = await SapFixedAssetRepository.get(id);
        const actionHistories =
            await SapFixedAssetRepository.getActionHistories(id);
        const assetStatements =
            await AssetStatementRepository.mgetBySapFixedAsset(id);
        const constructionStatement =
            await ConstructionStatementRepository.mget(
                assetStatements.map(as => as.constructionStatementId),
            ).then(res => (res.length > 0 ? res[0] : null));
        if (!constructionStatement) {
            return setState({
                sapFixedAsset,
                users,
                actionHistories,
            });
        }
        const construction = await ConstructionRepository.getByContract(
            constructionStatement.contractId,
        );
        const projects = await ProjectRepository.listByConstruction(
            construction,
        );
        const designs = await DesignRepository.listByConstruction(construction);
        setState({
            sapFixedAsset,
            construction,
            designs,
            users,
            projects,
            actionHistories,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return state;
};

const ParentAssetSummary: NextPage<Props> = ({ sapFixedAssetId }) => {
    const state = useParentAssetSummaryState(sapFixedAssetId);
    if (!state) return null;
    const {
        sapFixedAsset,
        construction,
        designs,
        users,
        projects,
        actionHistories,
    } = state;
    const bc = (
        <Breadcrumb
            items={[
                { text: '資産保全台帳', href: '/assets' },
                {
                    text: `${sapFixedAsset.assetName}`,
                    href: '/',
                    active: true,
                },
            ]}
        />
    );
    const assetManager = users.find(u => u.id === sapFixedAsset.userId);
    const editAssetManager = () => {
        const onUpdateAssetManger = async (userId: number) => {
            if (!sapFixedAsset.id) return assertsIsExists(sapFixedAsset);
            const newSapFixedAsset = new SapFixedAsset(
                sapFixedAsset.id,
                userId,
                sapFixedAsset.key,
                sapFixedAsset.assetName,
                sapFixedAsset.assetText,
                sapFixedAsset.recordedAt,
                sapFixedAsset.businessCode,
                sapFixedAsset.wbsCode,
                sapFixedAsset.assetClassCode,
                sapFixedAsset.termEndPrice,
                sapFixedAsset.assetChecklists,
                new Date(),
                new Date(),
            );
            await SapFixedAssetRepository.update(
                sapFixedAsset.id,
                newSapFixedAsset,
            );
            location.reload();
        };
        return (
            <Dropdown>
                <Dropdown.Toggle className='border-0'>
                    <FontAwesomeIcon className='' icon={faEdit} />
                </Dropdown.Toggle>
                <Dropdown.Menu alignRight>
                    {users.map(u => (
                        <Dropdown.Item
                            key={u.id}
                            onSelect={() => {
                                if (!u.id) return assertsIsExists(u.id);
                                onUpdateAssetManger(u.id);
                            }}
                        >
                            {u.department + u.name}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        );
    };
    return (
        <Page>
            <section>
                {bc}
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            {sapFixedAsset.assetName}
                        </h3>
                    </div>
                </div>
                <AssetDetailTabs sapFixedAsset={sapFixedAsset} />
                <Row>
                    <Col>
                        <h5 className='font-weight-bold mb-4'>ヒストリー</h5>
                        <Card>
                            <ActionHistoryList
                                actionHistories={actionHistories}
                            />
                        </Card>
                    </Col>
                    <Col>
                        <h5 className='font-weight-bold mb-4'>基本情報</h5>
                        <Card>
                            <Card.Body>
                                <Table hover borderless>
                                    <tbody>
                                        <tr>
                                            <th className='w-25'>
                                                資産管理担当者
                                            </th>
                                            <td className='d-flex justify-content-between align-items-center'>
                                                <span className='mr-3'>
                                                    {assetManager
                                                        ? assetManager.department +
                                                          ' ' +
                                                          assetManager.name
                                                        : '未設定'}
                                                </span>
                                                {editAssetManager()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='w-25'>事業</th>
                                            <td>
                                                {projects?.map(p => (
                                                    <Link
                                                        key={p.id}
                                                        href={`/projects/${p.id}`}
                                                        passHref
                                                    >
                                                        <a>{p.name}</a>
                                                    </Link>
                                                )) || '紐づく事業がありません'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='w-25'>設計</th>
                                            <td>
                                                {designs?.map(d => (
                                                    <Link
                                                        key={d.id}
                                                        href={`/designs/${d.id}`}
                                                        passHref
                                                    >
                                                        <a>{d.name}</a>
                                                    </Link>
                                                )) || '紐づく設計がありません'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='w-25'>工事</th>
                                            <td>
                                                {construction ? (
                                                    <Link
                                                        href={`/constructions/${construction.id}`}
                                                        passHref
                                                    >
                                                        <a>
                                                            {construction.name}
                                                        </a>
                                                    </Link>
                                                ) : (
                                                    '紐づく工事がありません'
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            sapFixedAssetId: Number(params?.parent_asset_id),
        },
    };
};

export default ParentAssetSummary;
