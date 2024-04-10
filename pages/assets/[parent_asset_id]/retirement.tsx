import React, { FC, useEffect, useState } from 'react';
import {
    AssetDetailTabs,
    Breadcrumb,
    Page,
    Tabs,
} from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import {
    Contract,
    CostItem,
    RetirementCostItem,
    SapFixedAsset,
} from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
    RetirementCostItemRepository,
    SapFixedAssetRepository,
} from '@/Domain/Repository';
import { Badge, Table } from 'react-bootstrap';
import { sum } from 'lodash';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { CostItemService } from '@/Domain/Service';
interface Props {
    sapFixedAssetId: number;
    status: string;
}

type State =
    | {
          sapFixedAsset: SapFixedAsset;
      }
    | {
          sapFixedAsset: SapFixedAsset;
          costItems: CostItem[];
          contract: Contract;
          retirementCostItems: RetirementCostItem[];
      };

const useParentAssetRetirementState = (id: number, status: string) => {
    const [state, setState] = useState<State>();

    const fetchData = async () => {
        const sapFixedAsset = await SapFixedAssetRepository.get(id);
        const assetStatements =
            await AssetStatementRepository.mgetBySapFixedAsset(id);
        const constructionStatement =
            await ConstructionStatementRepository.mget(
                assetStatements.map(as => as.constructionStatementId),
            ).then(res => (res.length > 0 ? res[0] : null));
        if (!constructionStatement) {
            return setState({
                sapFixedAsset,
            });
        }
        const costItems = constructionStatement.costItems;
        const retirementCostItems =
            await RetirementCostItemRepository.mgetByCostItems(costItems);
        const construction = await ConstructionRepository.getByContract(
            constructionStatement.contractId,
        );
        const contract = construction.firstContract;
        setState({
            sapFixedAsset,
            costItems,
            retirementCostItems,
            contract,
        });
    };

    useEffect(() => {
        fetchData();
    }, [status]);

    return state;
};

const ChildAssetRows: FC<{
    status: string;
    sapFixedAsset: SapFixedAsset;
    costItems: CostItem[];
    contract: Contract;
    retirementCostItems: RetirementCostItem[];
}> = ({ status, sapFixedAsset, costItems, retirementCostItems, contract }) => {
    const totalRetirementedAmount = (costItem: CostItem) =>
        sum(
            retirementCostItems
                .filter(rci => rci.costItem.id === costItem.id)
                .map(rci => rci.amount),
        );

    const childAssetRows = costItems
        .filter(item => {
            switch (status) {
                case 'rest':
                    return item.amount > totalRetirementedAmount(item);
                case 'complete':
                    return item.amount === totalRetirementedAmount(item);
                case '':
                    return item;
            }
        })
        .map((item, index) => {
            const tags = item.costItemTags.map(tag => (
                <Badge key={tag.id} variant='info' className='mr-2'>
                    {tag.name}
                </Badge>
            ));
            const latestRetirementDate = retirementCostItems
                .map(rci => rci.createdAt)
                .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];

            const contractAtCostItemPrice =
                CostItemService.calcContractAtCostItemPrice(item, contract);
            const sumRetirementCostItemsPrice = sum(
                retirementCostItems.map(rci => rci.price),
            );
            return (
                <tr key={index}>
                    <td>{item.id}</td>
                    <td>{tags}</td>
                    <td title={item.name}>
                        <Link
                            href={`/assets/[parent_assets]/[child_asset]`}
                            as={`/assets/${sapFixedAsset.id}/${item.id}`}
                            passHref
                        >
                            {item.name}
                        </Link>
                    </td>
                    <td>{item.amount}</td>
                    <td>{contractAtCostItemPrice}</td>
                    <td>{item.amount - totalRetirementedAmount(item)}</td>
                    <td>
                        {contractAtCostItemPrice - sumRetirementCostItemsPrice}
                    </td>
                    <td>
                        {DateTime.fromJSDate(latestRetirementDate).toFormat(
                            'yyyy年MM月dd日',
                        )}
                    </td>
                </tr>
            );
        });
    return <>{childAssetRows}</>;
};

const ParentAssetRetirement: NextPage<Props> = ({
    sapFixedAssetId,
    status,
}) => {
    const state = useParentAssetRetirementState(sapFixedAssetId, status);
    if (!state) return null;
    const bc = (
        <Breadcrumb
            items={[
                { text: '資産保全台帳', href: '/assets' },
                {
                    text: `${state.sapFixedAsset.assetName}`,
                    href: '/',
                    active: true,
                },
            ]}
        />
    );
    const childAssetRows =
        'costItems' in state ? (
            <ChildAssetRows status={status} {...state} />
        ) : null;
    return (
        <Page>
            <section>
                {bc}
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            {state.sapFixedAsset.assetName}
                        </h3>
                    </div>
                </div>
                <AssetDetailTabs sapFixedAsset={state.sapFixedAsset} />
                <Tabs
                    items={[
                        {
                            href: '/assets/[parent_asset_id]/retirement?status=rest',
                            as: `/assets/${sapFixedAssetId}/retirement?status=rest`,
                            text: '残存',
                        },
                        {
                            href: '/assets/[parent_asset_id]/retirement?status=complete',
                            as: `/assets/${sapFixedAssetId}/retirement?status=complete`,
                            text: '除却済み',
                        },
                        {
                            href: '/assets/[parent_asset_id]/retirement',
                            as: `/assets/${sapFixedAssetId}/retirement`,
                            text: 'すべて',
                        },
                    ]}
                    className='my-4'
                />
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>ID</th>
                                <th style={{ width: '300px' }}>特定情報</th>
                                <th style={{ width: '500px' }}>資産詳細情報</th>
                                <th style={{ width: '72px' }}>元数量</th>
                                <th style={{ width: '120px' }}>契約時金額</th>
                                <th style={{ width: '72px' }}>残数量</th>
                                <th style={{ width: '120px' }}>残金額</th>
                                <th style={{ width: '148px' }}>最終除却日</th>
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

export default ParentAssetRetirement;
