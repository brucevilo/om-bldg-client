import React, { FC } from 'react';
import { Badge, Card } from 'react-bootstrap';
import { RetirementCostItem, Construction } from '@/Domain/Entity';
import { RetirementResultCardBody } from '@/Presentation/Component';
import { groupBy } from 'lodash';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { RetirementService } from '@/Domain/Service';

interface Props {
    retirementCostItemsGroupByAssetStatement: RetirementCostItem[];
    construction: Construction;
}

export const RetirementResultCard: FC<Props> = ({
    construction,
    retirementCostItemsGroupByAssetStatement,
}) => {
    const assetStatement =
        retirementCostItemsGroupByAssetStatement[0].assetStatement;
    assertsIsExists(assetStatement, '除却に紐づく資産がありません');
    assertsIsNotNull(
        assetStatement.sapRecordedPrice,
        '資産に除却元の価格が紐づいていません',
    );
    return (
        <Card
            key={retirementCostItemsGroupByAssetStatement[0].assetStatement.id}
            className='my-3'
        >
            <Card.Header className='bg-white'>
                <div className='d-flex justify-content-between align-items-center'>
                    <span>{assetStatement.name}</span>
                    <span>
                        {assetStatement.sapRecordedPrice.toLocaleString()}円
                    </span>
                </div>
            </Card.Header>
            {Object.values(
                groupBy(
                    retirementCostItemsGroupByAssetStatement,
                    re => re.costItem.id,
                ),
            ).map(retirementCostItemsGroupByCostItemAndAssetStatement => (
                <RetirementResultCardBody
                    key={`${retirementCostItemsGroupByCostItemAndAssetStatement[0].id}`}
                    construction={construction}
                    retirementCostItemsGroupByCostItemAndAssetStatement={
                        retirementCostItemsGroupByCostItemAndAssetStatement
                    }
                />
            ))}
            <Card.Footer className='bg-white'>
                <div className='text-right'>
                    <Badge variant='info' className='mr-2'>
                        除却後の価格
                    </Badge>
                    <span>
                        {RetirementService.calcRemainSapRecordedPrice(
                            assetStatement,
                            retirementCostItemsGroupByAssetStatement,
                        )}
                        円
                    </span>
                </div>
            </Card.Footer>
        </Card>
    );
};
