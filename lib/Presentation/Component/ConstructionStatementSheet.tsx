import React, { FC } from 'react';
import { ConstructionStatement } from '@/Domain/Entity';
import {
    ListGroup,
    ListGroupItem,
    Accordion,
    AccordionCollapse,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import Styles from '@/Presentation/Style/Components/ConstructionStatementSheet.module.scss';
import { uniq } from 'lodash';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface Props {
    sheet: Pick<
        ConstructionStatement,
        'costItems' | 'name' | 'isCollateral' | 'projectCode' | 'term'
    >;
}

export const ConstructionStatementSheet: FC<Props> = props => {
    const { sheet } = props;

    const tablesGroupByConstructionType = (type: string, index: number) => {
        const items = sheet.costItems.filter(i => i.constructionType === type);
        const itemsTotalPrice = items.reduce(
            (total, current) => total + current.price,
            0,
        );
        return (
            <AccordionCollapse key={index} eventKey={sheet.name}>
                <Accordion defaultActiveKey={`${sheet.name}/${type}`}>
                    <div
                        className={`${Styles.sheet_secondary_level} d-flex justify-content-between py-2`}
                    >
                        <div>{type}</div>
                        <div>
                            <span className='mr-3'>
                                ¥{itemsTotalPrice.toLocaleString()}
                            </span>
                            <Accordion.Toggle
                                as='button'
                                className='bg-white border-0'
                                eventKey={`${sheet.name}/${type}`}
                            >
                                <FA icon={faChevronUp} />
                            </Accordion.Toggle>
                        </div>
                    </div>
                    <AccordionCollapse eventKey={`${sheet.name}/${type}`}>
                        <div className='table table-responsive mb-0 text-left'>
                            <div
                                className={`${Styles.sheet_third_level} d-flex`}
                            >
                                <div className={Styles.cost_item_props_small}>
                                    明細ID
                                </div>
                                <div className={Styles.cost_item_props_large}>
                                    項目名称
                                </div>
                                <div className={Styles.cost_item_props_large}>
                                    形状寸法
                                </div>
                                <div
                                    className={`${Styles.cost_item_props_small} text-right`}
                                >
                                    単価
                                </div>
                                <div
                                    className={`${Styles.cost_item_props_small} text-right`}
                                >
                                    数量
                                </div>
                                <div
                                    className={`${Styles.cost_item_props_small} text-right`}
                                >
                                    作業/運搬
                                </div>
                                <div
                                    className={`${Styles.cost_item_props_small} text-right`}
                                >
                                    金額
                                </div>
                            </div>
                            {items.map((item, index) => (
                                <div
                                    key={index}
                                    className={`${Styles.sheet_third_level} d-flex`}
                                >
                                    <div
                                        className={`${Styles.cost_item_props_small} number text-left`}
                                    >
                                        {item.code}
                                    </div>
                                    <div
                                        className={Styles.cost_item_props_large}
                                    >
                                        {item.name}
                                    </div>
                                    <div
                                        className={Styles.cost_item_props_large}
                                    >
                                        {item.dimension}
                                    </div>
                                    <div
                                        className={`${Styles.cost_item_props_small} number text-right`}
                                    >
                                        {item.unitPrice.toLocaleString()}
                                    </div>
                                    <div
                                        className={`${Styles.cost_item_props_small} number text-right`}
                                    >
                                        {item.amount}
                                    </div>
                                    <div
                                        className={`${Styles.cost_item_props_small} text-right`}
                                    >
                                        {item.constructionTime}
                                        {item.constructionTime && '/'}
                                        {item.transportationTime}
                                    </div>
                                    <div
                                        className={`${Styles.cost_item_props_small} number text-right`}
                                    >
                                        {item.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AccordionCollapse>
                </Accordion>
            </AccordionCollapse>
        );
    };

    return (
        <ListGroup className='mb-5'>
            <ListGroupItem className='pb-0'>
                <Accordion defaultActiveKey={sheet.name}>
                    <div
                        className={`${Styles.sheet_first_level} d-flex justify-content-between`}
                    >
                        <span>
                            {sheet.name}　
                            {sheet.isCollateral && (
                                <span
                                    className='text-white p-1 rounded mr-1'
                                    style={{ backgroundColor: '#3273DC' }}
                                >
                                    附帯工事
                                </span>
                            )}
                            <span
                                className='text-white p-1 rounded'
                                style={{ backgroundColor: '#3273DC' }}
                            >
                                PJコード：{sheet.projectCode}
                            </span>
                        </span>
                        <div className='d-flex'>
                            <div className='mr-3'>
                                <span>工事工期：</span>
                                <span>
                                    {DateTime.fromJSDate(sheet.term).toFormat(
                                        'yyyy/MM/dd',
                                    )}
                                </span>
                            </div>
                            <div className='mr-3'>
                                ¥
                                {sheet.costItems
                                    .reduce(
                                        (total, current) =>
                                            total + current.price,
                                        0,
                                    )
                                    .toLocaleString()}
                            </div>
                            <Accordion.Toggle
                                as='button'
                                className='bg-white border-0'
                                eventKey={sheet.name}
                            >
                                <FA icon={faChevronUp} />
                            </Accordion.Toggle>
                        </div>
                    </div>
                    {uniq(sheet.costItems.map(i => i.constructionType)).map(
                        (type, index) =>
                            tablesGroupByConstructionType(type, index),
                    )}
                </Accordion>
            </ListGroupItem>
        </ListGroup>
    );
};
