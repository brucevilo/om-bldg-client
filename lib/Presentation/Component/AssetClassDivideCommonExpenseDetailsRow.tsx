import React, { FC } from 'react';
import { ConstructionStatement } from '@/Domain/Entity';
import { ConstructionType } from '@/Domain/ValueObject';

interface Props {
    constructionStatements: ConstructionStatement[];
    constructionType: ConstructionType;
}

export const AssetClassDivideCommonExpenseDetailsRow: FC<Props> = (
    props: Props,
) => {
    const { constructionStatements, constructionType } = props;
    const priceGroupedByAllConstructionStatements =
        constructionStatements.reduce(
            (total, current) =>
                total +
                current.aggregateCostItemsWithSpecificConstructionType(
                    constructionType,
                ),
            0,
        );
    const priceGroupedByConstructionStatement = constructionStatements.map(
        (cs, index) => {
            const price =
                cs.aggregateCostItemsWithSpecificConstructionType(
                    constructionType,
                );
            return (
                <td key={index} className='number'>
                    {price.toLocaleString()}
                </td>
            );
        },
    );
    return (
        <tr>
            <td />
            <td />
            <td title={'うち、' + constructionType}>
                うち、{constructionType}
            </td>
            <td className='number'>
                {priceGroupedByAllConstructionStatements.toLocaleString()}
            </td>
            {priceGroupedByConstructionStatement}
        </tr>
    );
};
