import React, { FC } from 'react';
import { ConstructionStatement } from '@/Domain/Entity';
import { AssetClassDirectExpenseDivideService } from '@/Domain/Service';

interface Props {
    constructionStatements: ConstructionStatement[];
}

export const AssetClassDivideDirectExpenseDetailsRow: FC<Props> = (
    props: Props,
) => {
    const { constructionStatements } = props;

    const totalPriceByRow = (rowNumber: number) =>
        AssetClassDirectExpenseDivideService.calcDivisionRowByAllConstructionType(
            constructionStatements,
            rowNumber,
        ).toLocaleString();

    const priceByConstructionStatement = (rowNumber: number) =>
        constructionStatements.map((cs, index) => {
            const price =
                AssetClassDirectExpenseDivideService.calcDivisionRowByConstructionType(
                    cs,
                ).find(v => v.rowNumber === rowNumber)?.price;
            return (
                <td key={index} className='number'>
                    {price?.toLocaleString()}
                </td>
            );
        });

    return (
        <>
            <tr>
                <td />
                <td />
                <td title='直接仮設工事'>直接仮設工事</td>
                <td className='number'>{totalPriceByRow(1)}</td>
                {priceByConstructionStatement(1)}
            </tr>
            <tr>
                <td />
                <td />
                <td title='部分撤去工事'>部分撤去工事</td>
                <td className='number'>{totalPriceByRow(2)}</td>
                {priceByConstructionStatement(2)}
            </tr>
            <tr>
                <td />
                <td />
                <td title='直接仮設及び部分撤去工事を除く直接工事費'>
                    直接仮設及び部分撤去工事を除く直接工事費
                </td>
                <td className='number'>{totalPriceByRow(3)}</td>
                {priceByConstructionStatement(3)}
            </tr>
            <tr>
                <td />
                <td>資産</td>
                <td title='直接仮設工事'>直接仮設工事</td>
                <td className='number'>{totalPriceByRow(4)}</td>
                {priceByConstructionStatement(4)}
            </tr>
            <tr>
                <td />
                <td />
                <td title='うち部分撤去工事'>うち、部分撤去工事 </td>
                <td className='number'>{totalPriceByRow(5)}</td>
                {priceByConstructionStatement(5)}
            </tr>
            <tr>
                <td />
                <td />
                <td title='直接仮設及び部分撤去工事を除く直接工事費'>
                    直接仮設及び部分撤去工事を除く直接工事費
                </td>
                <td className='number'>{totalPriceByRow(6)}</td>
                {priceByConstructionStatement(6)}
            </tr>
            <tr>
                <td />
                <td title='費用'>費用</td>
                <td title='直接仮設工事'>直接仮設工事</td>
                <td className='number'>{totalPriceByRow(7)}</td>
                {priceByConstructionStatement(7)}
            </tr>
            <tr>
                <td />
                <td />
                <td title='うち、部分撤去工事'>うち、部分撤去工事</td>
                <td className='number'>{totalPriceByRow(8)}</td>
                {priceByConstructionStatement(8)}
            </tr>
            <tr>
                <td />
                <td />
                <td title='直接仮設及び部分撤去工事を除く直接工事費'>
                    直接仮設及び部分撤去工事を除く直接工事費
                </td>
                <td className='number'>{totalPriceByRow(9)}</td>
                {priceByConstructionStatement(9)}
            </tr>
        </>
    );
};
