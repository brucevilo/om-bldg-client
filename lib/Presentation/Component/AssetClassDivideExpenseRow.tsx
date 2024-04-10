import React, { FC } from 'react';
import { ConstructionStatement, CostItem } from '@/Domain/Entity';

interface Props {
    expenseType: '直接工事費' | '共通費';
    constructionStatements: ConstructionStatement[];
}

export const AssetClassDivideExpenseRow: FC<Props> = (props: Props) => {
    const { expenseType, constructionStatements } = props;

    const constructionTypesGroupedByExpenseTypeFilter = (
        ci: CostItem,
    ): boolean => {
        return expenseType === '直接工事費'
            ? ci.isDirectExpence
            : ci.isCommonExpence;
    };

    const priceGroupedByConstructionTypeOfAllConstructionStatements =
        constructionStatements
            .map(cs => cs.costItems)
            .flat()
            .filter(constructionTypesGroupedByExpenseTypeFilter)
            .reduce((total, current) => total + current.price, 0);

    const priceGroupedByConstructionStatement = constructionStatements.map(
        cs => {
            const totalPrice = cs.costItems
                .filter(constructionTypesGroupedByExpenseTypeFilter)
                .reduce((total, current) => total + current.price, 0);
            return (
                <td key={cs.id} className='number'>
                    {totalPrice.toLocaleString()}
                </td>
            );
        },
    );
    return (
        <tr>
            <td />
            <td title={expenseType}>{expenseType}</td>
            <td />
            <td className='number'>
                {priceGroupedByConstructionTypeOfAllConstructionStatements.toLocaleString()}
            </td>
            {priceGroupedByConstructionStatement}
        </tr>
    );
};
