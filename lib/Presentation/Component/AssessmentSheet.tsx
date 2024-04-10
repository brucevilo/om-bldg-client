import React, { FC } from 'react';
import { Construction, Contract, Design } from '@/Domain/Entity';
import { Assessment } from '@/Domain/ValueObject';
import { uniq } from 'lodash';
import { ListGroup, ListGroupItem, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import Styles from '@/Presentation/Style/Components/ConstructionStatementSheet.module.scss';

export interface AssessmentSheetProps {
    contractable: Construction | Design;
    contract: Contract;
    assessment: Assessment;
    id?: number;
    setAssessment: (assessment: Assessment) => void;
}

const AssessmentSheetRowDetail: FC<{
    name: string;
    size: string;
    amount: string;
    unit: string;
    price: string;
    outputType: string;
}> = ({ name, size, amount, unit, price, outputType }) => {
    return (
        <div className={`${Styles.sheet_third_level} d-flex py-1`}>
            <div
                className={`${Styles.cost_item_props_small}`}
                style={{ width: '700px' }}
            >
                {name}
            </div>
            <div
                className={`${Styles.cost_item_props_small}`}
                style={{ width: '300px' }}
            >
                {size}
            </div>
            <div className={`${Styles.cost_item_props_small}`}>{amount}</div>
            <div className={`${Styles.cost_item_props_small}`}>{unit}</div>
            <div className={`${Styles.cost_item_props_small} text-right`}>
                {price}
            </div>
            <div className={`${Styles.cost_item_props_small} text-right`}>
                {outputType}
            </div>
        </div>
    );
};

export const AssessmentSheet: FC<AssessmentSheetProps> = ({
    contractable,
    contract,
    assessment,
    setAssessment,
}) => {
    if (!assessment)
        return (
            <div className='text-center my-4'>
                <Spinner animation='border'>
                    <span className='sr-only'>Loading...</span>
                </Spinner>
            </div>
        );
    const updateIsOpen = (part: string, isOpen: boolean) => {
        const newStatements = assessment.statements.map(s => {
            if (s.part !== part) return s;
            return { ...s, isOpen: isOpen };
        });
        setAssessment({
            ...assessment,
            statements: newStatements,
        });
    };
    const assessmentParts = uniq(assessment.statements.map(s => s.part));
    const rows: JSX.Element[] = [];
    assessmentParts.forEach(part => {
        const rowsDetails: JSX.Element[] = [];
        const isOpen = !!assessment.statements.find(s => s.part === part)
            ?.isOpen;
        const partStatements = assessment.statements.filter(
            s => s.part === part,
        );
        const partSubTotal = partStatements.reduce(
            (sum, statement) => (statement.price as number) + sum,
            0,
        );
        if (!partSubTotal) {
            throw new Error('小計が取得できませんでした');
        }
        const tax = Math.ceil(partSubTotal * (contract.taxRate / 100));
        const totalPrice = partSubTotal + tax;
        partStatements.forEach(statement =>
            rowsDetails.push(
                <AssessmentSheetRowDetail
                    key={`${part}-${statement.name}`}
                    name={statement.name}
                    size={statement.size}
                    amount={String(statement.amount)}
                    unit={statement.unit}
                    price={statement.price?.toLocaleString() || ''}
                    outputType={
                        assessment.outputType === '工事用'
                            ? '共通費共'
                            : '諸経費共'
                    }
                />,
            ),
        );
        rowsDetails.push(
            <>
                <AssessmentSheetRowDetail
                    name='小計'
                    size=''
                    amount=''
                    unit=''
                    price={partSubTotal.toLocaleString()}
                    outputType=''
                />
                <AssessmentSheetRowDetail
                    name='消費税及び地方消費税相当額'
                    size=''
                    amount=''
                    unit=''
                    price={tax.toLocaleString()}
                    outputType=''
                />
                <AssessmentSheetRowDetail
                    name='計'
                    size=''
                    amount=''
                    unit=''
                    price={totalPrice.toLocaleString()}
                    outputType=''
                />
            </>,
        );
        rows.push(
            <>
                {isOpen ? (
                    <>
                        <div
                            className={`${Styles.sheet_first_level} d-flex py-2`}
                        >
                            <div
                                className={`${Styles.cost_item_props_small}`}
                                style={{ width: '800px', cursor: 'pointer' }}
                                onClick={() =>
                                    updateIsOpen(
                                        part,
                                        !partStatements[0].isOpen,
                                    )
                                }
                            >
                                （{part}）
                                <FA icon={faAngleUp} className='text-info' />
                            </div>
                        </div>
                        {rowsDetails}
                    </>
                ) : (
                    <>
                        <div
                            className={`${Styles.sheet_first_level} d-flex py-2`}
                        >
                            <div
                                className={`${Styles.cost_item_props_small}`}
                                style={{ width: '800px', cursor: 'pointer' }}
                                onClick={() =>
                                    updateIsOpen(
                                        part,
                                        !partStatements[0].isOpen,
                                    )
                                }
                            >
                                （{part}）
                                <FA icon={faAngleDown} className='text-info' />
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small}`}
                                style={{ width: '300px' }}
                            >
                                {partStatements[0].size}
                            </div>
                            <div className={`${Styles.cost_item_props_small}`}>
                                1
                            </div>
                            <div className={`${Styles.cost_item_props_small}`}>
                                式
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small} text-right`}
                            >
                                {partSubTotal.toLocaleString()}
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small} text-right`}
                            >
                                {assessment.outputType === '工事用'
                                    ? '共通費共'
                                    : '諸経費共'}
                            </div>
                        </div>
                        <AssessmentSheetRowDetail
                            name='消費税及び地方消費税相当額'
                            size=''
                            amount='1'
                            unit='式'
                            price={tax.toLocaleString()}
                            outputType=''
                        />
                        <AssessmentSheetRowDetail
                            name='計'
                            size=''
                            amount=''
                            unit=''
                            price={totalPrice.toLocaleString()}
                            outputType=''
                        />
                    </>
                )}
                <div className={`${Styles.sheet_third_level} pb-5`}></div>
            </>,
        );
    });
    return (
        <div>
            <Table borderless className='mb-4 border bg-white'>
                <thead>
                    <tr>
                        <th>予定金額</th>
                        <th style={{ width: '200px' }}>契約金額（税込）</th>
                        {contractable.firstContract.id === contract.id && (
                            <th style={{ width: '300px' }}>落札率</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>￥{contract.expectedPrice?.toLocaleString()}</td>
                        <td>￥{contract.contractedPrice?.toLocaleString()}</td>
                        {contractable.firstContract.id === contract.id && (
                            <td>{Math.floor(contract.rate * 10000) / 10000}</td>
                        )}
                    </tr>
                </tbody>
            </Table>
            <Table borderless className='mb-4 border bg-white break'>
                <thead>
                    <tr>
                        <th>工事名称</th>
                        <th style={{ width: '200px' }}>
                            {contract.constructionId
                                ? '請負代金額'
                                : '業務委託料'}
                        </th>
                        <th style={{ width: '300px' }}>
                            （うち消費税及び地方消費税相当額）
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td title={contractable.name}>{contractable.name}</td>
                        <td>￥{contract.contractedPrice?.toLocaleString()}-</td>
                        <td>
                            ￥
                            {Math.ceil(
                                (contract.contractedPriceWithoutTax || 0) *
                                    (contract.taxRate / 100),
                            ).toLocaleString()}
                            -
                        </td>
                    </tr>
                </tbody>
            </Table>
            <ListGroup className='mb-5'>
                <ListGroupItem className='pb-0'>
                    <div className='table table-responsive mb-0 text-left'>
                        <div
                            className={`${Styles.sheet_third_level} d-flex`}
                            style={{ fontWeight: 700 }}
                        >
                            <div
                                className={Styles.cost_item_props_small}
                                style={{ width: '700px' }}
                            >
                                名称
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small}`}
                                style={{ width: '300px' }}
                            >
                                形状寸法
                            </div>
                            <div className={`${Styles.cost_item_props_small}`}>
                                数量
                            </div>
                            <div className={`${Styles.cost_item_props_small}`}>
                                単位
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small} text-right`}
                            >
                                金額
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small} text-right`}
                            >
                                摘要
                            </div>
                        </div>
                        {rows}
                        <div className={`${Styles.sheet_first_level} d-flex`}>
                            <div
                                className={`${Styles.cost_item_props_small}`}
                                style={{ width: '700px' }}
                            >
                                合計
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small}`}
                                style={{ width: '300px' }}
                            ></div>
                            <div
                                className={`${Styles.cost_item_props_small}`}
                            ></div>
                            <div
                                className={`${Styles.cost_item_props_small}`}
                            ></div>
                            <div
                                className={`${Styles.cost_item_props_small} text-right`}
                            >
                                {contract.contractedPrice?.toLocaleString()}
                            </div>
                            <div
                                className={`${Styles.cost_item_props_small} text-right`}
                            ></div>
                        </div>
                    </div>
                </ListGroupItem>
            </ListGroup>
        </div>
    );
};
