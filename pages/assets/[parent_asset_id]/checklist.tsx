import React, { useEffect, useState } from 'react';
import {
    AssetDetailTabs,
    Breadcrumb,
    Page,
    Tabs,
} from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import {
    CostItem,
    RetirementCostItem,
    SapFixedAsset,
    User,
} from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionStatementRepository,
    RetirementCostItemRepository,
    SapFixedAssetRepository,
    UserRepository,
} from '@/Domain/Repository';
import { Badge, Table } from 'react-bootstrap';
import { AssetCheckTermService } from '@/App/Service';
import { DateTime } from 'luxon';
import { sum } from 'lodash';
import Link from 'next/link';

interface Props {
    sapFixedAssetId: number;
    status: string;
}

interface State {
    sapFixedAsset: SapFixedAsset;
    costItems: CostItem[];
    users: User[];
    retirementCostItems: RetirementCostItem[];
}
const currentTerm = AssetCheckTermService.getCheckTerm();
const hasCostItemCurrentChecklist = (item: CostItem) => {
    return item.assetChecklists.some(checklist => {
        if (item.assetChecklists.length === 0) return item;
        return currentTerm.contains(DateTime.fromJSDate(checklist.createdAt));
    });
};

const useParentAssetChecklistState = (id: number, status: string) => {
    const [state, setState] = useState<State>();

    const fetchData = async () => {
        const sapFixedAsset = await SapFixedAssetRepository.get(id);
        const assetStatements =
            await AssetStatementRepository.mgetBySapFixedAsset(id);
        const constructionStatements =
            await ConstructionStatementRepository.mget(
                assetStatements.map(as => as.constructionStatementId),
            );
        const costItems = constructionStatements.flatMap(cs =>
            cs.costItems.filter(item => {
                if (!status) return item;
                if (status === 'checked') {
                    return hasCostItemCurrentChecklist(item);
                } else {
                    return !hasCostItemCurrentChecklist(item);
                }
            }),
        );
        const retirementCostItems =
            await RetirementCostItemRepository.mgetByCostItems(costItems);
        const users = await UserRepository.list();
        setState({
            sapFixedAsset,
            costItems,
            users,
            retirementCostItems,
        });
    };

    useEffect(() => {
        fetchData();
    }, [status]);

    return state;
};

const ParentAssetChecklist: NextPage<Props> = ({ sapFixedAssetId, status }) => {
    const state = useParentAssetChecklistState(sapFixedAssetId, status);
    if (!state) return null;
    const { sapFixedAsset, costItems, users, retirementCostItems } = state;
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
    const childAssetRows = costItems.map((item, index) => {
        const tags = item.costItemTags.map(tag => (
            <Badge key={tag.id} variant='info' className='mr-2'>
                {tag.name}
            </Badge>
        ));
        const checklist = item.assetChecklists.find(checklist => {
            return currentTerm.contains(
                DateTime.fromJSDate(checklist.createdAt),
            );
        });
        const checkedUser = users.find(user => user.id === checklist?.userId);
        const totalRetirementedAmount = sum(
            retirementCostItems
                .filter(rci => rci.costItem.id === item.id)
                .map(rci => rci.amount),
        );
        return (
            <tr key={index}>
                <td>{item.id}</td>
                <td>{tags}</td>
                <td>
                    <Link
                        href={`/assets/[parent_assets]/[child_asset]`}
                        as={`/assets/${sapFixedAsset.id}/${item.id}`}
                        passHref
                    >
                        {item.name}
                    </Link>
                </td>
                <td>{item.amount - totalRetirementedAmount}</td>
                <td>
                    {checklist
                        ? DateTime.fromJSDate(checklist.createdAt).toFormat(
                              'yyyy年MM月dd日',
                          )
                        : '---'}
                </td>
                <td>{checkedUser ? checkedUser.name : '---'}</td>
            </tr>
        );
    });
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
                <Tabs
                    items={[
                        {
                            href: '/assets/[parent_asset_id]/checklist?status=unchecked',
                            as: `/assets/${sapFixedAssetId}/checklist?status=unchecked`,
                            text: '未照合',
                        },
                        {
                            href: '/assets/[parent_asset_id]/checklist?status=checked',
                            as: `/assets/${sapFixedAssetId}/checklist?status=checked`,
                            text: '照合済',
                        },
                        {
                            href: '/assets/[parent_asset_id]/checklist',
                            as: `/assets/${sapFixedAssetId}/checklist`,
                            text: 'すべて',
                        },
                    ]}
                    className='my-4'
                />
                <div className='table-responsive'>
                    <Table hover style={{ whiteSpace: 'nowrap' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>ID</th>
                                <th style={{ width: '300px' }}>特定情報</th>
                                <th style={{ width: '500px' }}>資産詳細情報</th>
                                <th style={{ width: '72px' }}>残数量</th>
                                <th style={{ width: '148px' }}>現物照合日</th>
                                <th style={{ width: '140px' }}>
                                    現物照合担当者
                                </th>
                            </tr>
                        </thead>
                        <tbody>{childAssetRows}</tbody>
                    </Table>
                </div>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
    return {
        props: {
            sapFixedAssetId: Number(ctx.query.parent_asset_id),
            status: (ctx.query.status as string) || '',
        },
    };
};

export default ParentAssetChecklist;
