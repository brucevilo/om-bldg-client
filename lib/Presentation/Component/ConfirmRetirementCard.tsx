import React, { FC } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Construction, RetirementCostItem } from '@/Domain/Entity';
import { DateTime } from 'luxon';
import { RetirementCreateParams, RetirementService } from '@/Domain/Service';
import { assertsIsNotNull } from '@/Infrastructure';
import {
    DoneRetirementBadge,
    PartObRetirementBadge,
} from '@/Presentation/Component';

interface Props {
    construction: Construction;
    retirementCreateParamsGroupByAssetStatement: RetirementCreateParams[];
    retirementCostItems: RetirementCostItem[];
}

const ConfirmRetirementCostItemInCardBody: FC<{
    construction: Construction;
    retirementCreateParams: RetirementCreateParams;
    retirementCostItems: RetirementCostItem[];
}> = ({ construction, retirementCreateParams, retirementCostItems }) => {
    const remainCostItemAmount =
        RetirementService.calcRetirementedRemainCostItemAmount(
            retirementCreateParams.costItem,
            retirementCostItems,
        );
    const remainCostItemPrice =
        RetirementService.calcRetirementedRemainCostItemPrice(
            retirementCreateParams.costItem,
            retirementCostItems,
        );

    return (
        <div
            key={retirementCreateParams.costItem.id}
            className='d-flex justify-content-between'
        >
            <div>
                <div>
                    {retirementCreateParams.costItem.amount -
                        retirementCreateParams.amount ===
                    0 ? (
                        <DoneRetirementBadge className='mr-2' />
                    ) : (
                        <PartObRetirementBadge className='mr-2' />
                    )}

                    <span className='font-weight-bold ml-3'>
                        {retirementCreateParams.costItem.name}
                    </span>
                </div>
                <div className='d-flex justify-content-between'>
                    <div className='mt-3'>
                        <span className='mr-3 bg-light p-1'>資産テキスト</span>
                        <span className='mr-3'>
                            {DateTime.fromJSDate(
                                retirementCreateParams.assetStatement.createdAt,
                            ).year.toString() + construction?.name}
                        </span>
                        <span className='mr-3 bg-light p-1'>取得日</span>
                        <span className='mr-3'>
                            {DateTime.fromJSDate(
                                retirementCreateParams.assetStatement.createdAt,
                            ).toFormat('yyyy年MM月dd日')}
                        </span>
                        <span className='mr-3 bg-light p-1'>数量</span>
                        <span
                            className={`mr-3 ${
                                remainCostItemAmount -
                                    retirementCreateParams.amount ===
                                0
                                    ? ''
                                    : 'text-danger'
                            }`}
                        >
                            {remainCostItemAmount -
                                retirementCreateParams.amount ===
                            0
                                ? retirementCreateParams.amount
                                : `${remainCostItemAmount}->${
                                      remainCostItemAmount -
                                      retirementCreateParams.amount
                                  }`}
                        </span>
                    </div>
                </div>
            </div>
            <div className='d-flex align-items-center justify-content-end'>
                <p className='mb-0 text-danger'>
                    -
                    {retirementCreateParams.assetStatement.isPrivatized
                        ? Math.floor(
                              retirementCreateParams.costItem.unitPrice *
                                  retirementCreateParams.amount *
                                  construction.latestContract.rate,
                          )
                        : remainCostItemPrice.toLocaleString()}
                    円
                </p>
            </div>
        </div>
    );
};

export const ConfirmRetirementCard: FC<Props> = (props: Props) => {
    const {
        construction,
        retirementCreateParamsGroupByAssetStatement,
        retirementCostItems,
    } = props;
    const contract = construction.latestContract;
    const assetStatement =
        retirementCreateParamsGroupByAssetStatement[0].assetStatement;
    assertsIsNotNull(
        assetStatement.sapRecordedPrice,
        'sapRecordedPriceが紐づいていない資産からは除却できません',
    );

    return (
        <Card className='mb-4' key={assetStatement.id}>
            <Card.Header className='bg-white'>
                <div className='d-flex justify-content-between'>
                    <p className='mb-0 font-weight-bold'>
                        {retirementCreateParamsGroupByAssetStatement[0]
                            .assetStatement.name || ''}
                    </p>
                    <p className='mb-0 font-weight-bold'>
                        {RetirementService.calcRemainSapRecordedPrice(
                            assetStatement,
                            retirementCostItems,
                        ).toLocaleString()}
                        円
                    </p>
                </div>
            </Card.Header>
            <Card.Body>
                {retirementCreateParamsGroupByAssetStatement.map(params => (
                    <ConfirmRetirementCostItemInCardBody
                        key={params.costItem.id}
                        retirementCreateParams={params}
                        construction={construction}
                        retirementCostItems={retirementCostItems}
                    />
                ))}
            </Card.Body>
            <Card.Footer>
                <div className='text-right'>
                    <Badge variant='info'>除却後の価格</Badge>
                    <span className='ml-2'>
                        {RetirementService.calcRetirementedSapRecordedPrice(
                            retirementCreateParamsGroupByAssetStatement,
                            retirementCostItems,
                            contract.rate,
                        )}
                        円
                    </span>
                </div>
            </Card.Footer>
        </Card>
    );
};
