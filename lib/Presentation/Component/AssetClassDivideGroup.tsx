import React, { FC } from 'react';
import { Accordion, Table } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { ConstructionStatement } from '@/Domain/Entity';
import {
    AssetClassDivideExpenseRow,
    AssetClassDivideDirectExpenseDetailsRow,
    AssetClassDivideCommonExpenseDetailsRow,
} from '@/Presentation/Component';
import { EnumToText } from '@/Infrastructure';
import { ConstructionTypes } from '@/Domain/ValueObject';

interface Props {
    constructionStatements: ConstructionStatement[];
}

/**
 * 資産クラス分割表
 */
export const AssetClassDivideGroup: FC<Props> = (props: Props) => {
    const { constructionStatements } = props;

    return (
        <div className='mb-5'>
            <Accordion defaultActiveKey='asset_class_divide'>
                <Accordion.Toggle
                    as='a'
                    className='mb-4 text-decoration-none text-dark d-block'
                    eventKey='asset_class_divide'
                >
                    <span className='mr-3'>資産クラス分割</span>
                    <FA icon={faChevronUp} />
                </Accordion.Toggle>
                <Accordion.Collapse eventKey='asset_class_divide'>
                    <div className='table-responsive'>
                        <Table className='bg-white'>
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }}>費用</th>
                                    <th style={{ width: '200px' }}>資産区分</th>
                                    <th style={{ width: '400px' }}>内容</th>
                                    <th style={{ width: '120px' }}>合計金額</th>
                                    {constructionStatements.map((cs, index) => (
                                        <th
                                            key={index}
                                            style={{
                                                width: '400px',
                                                textAlign: 'right',
                                            }}
                                        >
                                            {cs.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td />
                                    <td />
                                    <td />
                                    <td />
                                    {constructionStatements.map((cs, index) => (
                                        <td
                                            key={index}
                                            style={{ textAlign: 'right' }}
                                        >
                                            {EnumToText.ConstructionStatementClassificationToText(
                                                cs.classification,
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <AssetClassDivideExpenseRow
                                    expenseType='直接工事費'
                                    constructionStatements={
                                        constructionStatements
                                    }
                                />
                                <AssetClassDivideDirectExpenseDetailsRow
                                    constructionStatements={
                                        constructionStatements
                                    }
                                />
                                <AssetClassDivideExpenseRow
                                    expenseType='共通費'
                                    constructionStatements={
                                        constructionStatements
                                    }
                                />
                                {ConstructionTypes.COMMON_EXPENCE.map(t => (
                                    <AssetClassDivideCommonExpenseDetailsRow
                                        key={t}
                                        constructionStatements={
                                            constructionStatements
                                        }
                                        constructionType={t}
                                    />
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Accordion.Collapse>
            </Accordion>
        </div>
    );
};
