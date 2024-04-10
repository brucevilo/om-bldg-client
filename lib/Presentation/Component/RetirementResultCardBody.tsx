import React, { FC } from 'react';
import { RetirementCostItem, Construction } from '@/Domain/Entity';
import { Card } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { CostItemRetirementBadge } from '@/Presentation/Component';

interface Props {
    construction: Construction;
    retirementCostItemsGroupByCostItemAndAssetStatement: RetirementCostItem[];
}

export const RetirementResultCardBody: FC<Props> = ({
    construction,
    retirementCostItemsGroupByCostItemAndAssetStatement,
}) => {
    const costItem =
        retirementCostItemsGroupByCostItemAndAssetStatement[0].costItem;
    const assetStatement =
        retirementCostItemsGroupByCostItemAndAssetStatement[0].assetStatement;
    return (
        <Card.Body key={costItem.id}>
            <div className='d-flex justify-content-between'>
                <div>
                    <div>
                        <CostItemRetirementBadge
                            className='mr-2'
                            costItem={costItem}
                            retirementCostItems={
                                retirementCostItemsGroupByCostItemAndAssetStatement
                            }
                        />

                        <span className='font-weight-bold'>
                            {costItem.name}
                        </span>
                    </div>
                    <div className='d-flex justify-content-between'>
                        <div className='mt-3'>
                            <span className='mr-3 bg-light p-1 rounded'>
                                資産テキスト
                            </span>
                            <span className='mr-3'>
                                {DateTime.fromJSDate(
                                    assetStatement.createdAt,
                                ).year.toString() + construction?.name}
                            </span>
                            <span className='mr-3 bg-light p-1 rounded'>
                                取得日
                            </span>
                            <span className='mr-3'>
                                {DateTime.fromJSDate(
                                    assetStatement.createdAt,
                                ).toFormat('yyyy年MM月dd日')}
                            </span>
                            <span className='mr-3 bg-light p-1 rounded'>
                                数量
                            </span>
                            <span className={'mr-3'}>
                                {retirementCostItemsGroupByCostItemAndAssetStatement.reduce(
                                    (sum, re) => re.amount + sum,
                                    0,
                                )}
                            </span>
                        </div>
                    </div>
                </div>
                <div className='d-flex align-items-center justify-content-end'>
                    <p className='mb-0 text-danger'>
                        ▲
                        {retirementCostItemsGroupByCostItemAndAssetStatement.reduce(
                            (sum, re) => sum + re.price,
                            0,
                        )}
                        円
                    </p>
                </div>
            </div>
        </Card.Body>
    );
};
