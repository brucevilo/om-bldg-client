import React, { useEffect, useState } from 'react';
import { Breadcrumb, Page } from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import {
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
    CostItemRepository,
    RetirementCostItemRepository,
    SapFixedAssetRepository,
    UserRepository,
} from '@/Domain/Repository';
import { Badge, Button, Col, Row, Card } from 'react-bootstrap';
import {
    User,
    CostItem,
    SapFixedAsset,
    Contract,
    RetirementCostItem,
} from '@/Domain/Entity';
import { AssetCheckTermService } from '@/App/Service';
import { DateTime } from 'luxon';
import { ContractRate } from '@/Domain/ValueObject';
import { sum } from 'lodash';
import Link from 'next/link';

interface Props {
    costItemId: number;
    sapFixedAssetId: number;
}

interface State {
    costItem: CostItem;
    sapFixedAsset: SapFixedAsset;
    users: User[];
    contract: Contract;
    retirementCostItems: RetirementCostItem[];
}

const useChildAssetState = (costItemId: number, sapFixedAssetId: number) => {
    const [state, setState] = useState<State>();

    const fetchData = async () => {
        const costItem = await CostItemRepository.get(costItemId);
        const sapFixedAsset = await SapFixedAssetRepository.get(
            sapFixedAssetId,
        );
        const assetStatements =
            await AssetStatementRepository.mgetBySapFixedAsset(sapFixedAssetId);
        const constructionStatement =
            await ConstructionStatementRepository.mget(
                assetStatements.map(as => as.constructionStatementId),
            ).then(res => res[0]);
        const construction = await ConstructionRepository.getByContract(
            constructionStatement.contractId,
        );
        const contract = construction.firstContract;
        const users = await UserRepository.list();
        const retirementCostItems =
            await RetirementCostItemRepository.mgetByCostItem(costItem);

        setState({
            users,
            sapFixedAsset,
            costItem,
            contract,
            retirementCostItems,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return state;
};

const ChildAsset: NextPage<Props> = ({ costItemId, sapFixedAssetId }) => {
    const state = useChildAssetState(costItemId, sapFixedAssetId);
    if (!state) return null;
    const { costItem, users, sapFixedAsset, contract, retirementCostItems } =
        state;
    const bc = (
        <Breadcrumb
            items={[
                { text: '資産保全台帳', href: '/assets' },
                {
                    text: `${sapFixedAsset.assetName}`,
                    href: '/assets/[parent_assets]/summary',
                    as: `/assets/${sapFixedAssetId}/summary`,
                },
                {
                    text: costItem.name,
                    href: '/',
                    active: true,
                },
            ]}
        />
    );
    const currentTerm = AssetCheckTermService.getCheckTerm();
    const checklist = costItem.assetChecklists.find(checklist => {
        return currentTerm.contains(DateTime.fromJSDate(checklist.createdAt));
    });
    const checkedUser = users.find(user => user.id === checklist?.userId);
    const contractRate = new ContractRate(
        Number(contract.expectedPriceWithTax),
        Number(contract.contractedPrice),
    ).value;
    const childAssetPriceAtContract = Math.ceil(costItem.price * contractRate);
    const childAssetPriceAfterRetirement = sum(
        retirementCostItems.map(rci => rci.price),
    );
    return (
        <Page>
            <section>
                {bc}
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            {costItem.name}
                        </h3>
                    </div>
                </div>
                <Row>
                    <Col>
                        <h5 className='font-weight-bold mb-4'>資産情報</h5>
                        <Card>
                            <Card.Body>
                                <div className='bg-white p-3'>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            取得日付
                                        </div>
                                        <div>
                                            {DateTime.fromJSDate(
                                                sapFixedAsset.recordedAt,
                                            ).toFormat('yyyy年MM月dd日')}
                                        </div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            元数量
                                        </div>
                                        <div>{costItem.amount}</div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            契約時金額
                                        </div>
                                        <div>{childAssetPriceAtContract}</div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            残数量
                                        </div>
                                        <div>
                                            {costItem.amount -
                                                sum(
                                                    retirementCostItems.map(
                                                        rci => rci.amount,
                                                    ),
                                                )}
                                        </div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            残金額
                                        </div>
                                        <div>
                                            {childAssetPriceAtContract -
                                                childAssetPriceAfterRetirement}
                                        </div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            現物照合日
                                        </div>
                                        <div>
                                            {checklist
                                                ? DateTime.fromJSDate(
                                                      checklist.createdAt,
                                                  ).toFormat('yyyy年MM月dd日')
                                                : '---'}
                                        </div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            現物照合担当者
                                        </div>
                                        <div>
                                            {checkedUser
                                                ? checkedUser.name
                                                : '---'}
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <h5 className='font-weight-bold mb-4'>付加情報</h5>
                        <Card>
                            <Card.Body>
                                <div className='bg-white p-3'>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            特定情報
                                        </div>
                                        <div>
                                            {costItem.costItemTags.map(
                                                (tag, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant='info mr-2'
                                                    >
                                                        {tag.name}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            メモ
                                        </div>
                                        <div>{costItem.memo}</div>
                                    </div>
                                    <div className='mb-3'>
                                        <div className='font-weight-bold'>
                                            画像
                                        </div>
                                        <div className='d-flex'>
                                            {costItem.photosInfo.map(
                                                (photo, index) => (
                                                    <img
                                                        key={index}
                                                        className='mr-3'
                                                        src={
                                                            process.env
                                                                .NEXT_PUBLIC_API_ORIGIN +
                                                            (photo?.path || '')
                                                        }
                                                        width={300}
                                                        height={300}
                                                        alt='image'
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                    <div className='d-flex justify-content-end'>
                                        <Link
                                            href={`/assets/${sapFixedAssetId}/${costItemId}/edit`}
                                            passHref
                                        >
                                            <Button
                                                as='a'
                                                variant='light'
                                                className='bg-white border'
                                            >
                                                編集する
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
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
            costItemId: Number(params?.child_asset_id),
            sapFixedAssetId: Number(params?.parent_asset_id),
        },
    };
};

export default ChildAsset;
