import React, { FC } from 'react';
import { ConstructionStatement, AssetClass } from '@/Domain/Entity';
import { Table, Accordion, AccordionCollapse } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface Props {
    constructionStatements: ConstructionStatement[];
    assetClasses: AssetClass[];
    accountItemKou: string;
}

export const AssetClassGroup: FC<Props> = (props: Props) => {
    const { assetClasses, constructionStatements, accountItemKou } = props;
    const assetClassRows = assetClasses.map((ac, index) => {
        const prices = constructionStatements.map(cs =>
            cs.aggregateCostItemsWithSpecificAssetClass(ac),
        );
        return (
            <tr key={index}>
                <td>
                    {ac.category}
                    {ac.accountDivision}
                </td>
                <td className='number'>
                    {prices.reduce((a, b) => a + b, 0).toLocaleString()}
                </td>
                {prices.map((price, index) => (
                    <td key={index}>{price.toLocaleString()}</td>
                ))}
            </tr>
        );
    });
    return (
        <Accordion defaultActiveKey={accountItemKou}>
            <div>
                {accountItemKou}
                <Accordion.Toggle
                    as='button'
                    className='border-0'
                    eventKey={accountItemKou}
                >
                    <FA icon={faChevronUp} />
                </Accordion.Toggle>
            </div>
            <AccordionCollapse eventKey={accountItemKou}>
                <div className='table-responsive'>
                    <Table className='bg-white'>
                        <thead>
                            <tr>
                                <th style={{ width: '120px' }}>項目</th>
                                <th style={{ width: '120px' }}>合計金額</th>
                                {constructionStatements.map((cs, index) => (
                                    <th key={index} style={{ width: '500px' }}>
                                        {cs.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{assetClassRows}</tbody>
                    </Table>
                </div>
            </AccordionCollapse>
        </Accordion>
    );
};
