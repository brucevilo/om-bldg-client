import {
    Classification,
    Construction,
    ConstructionStatement,
    Project,
} from '@/Domain/Entity';
import { isNil } from 'lodash';
import { DateTime } from 'luxon';
import React, { FC } from 'react';
import { Table, Form } from 'react-bootstrap';
import { HoverErrorPopup } from '../HoverErrorPopup';
import classnames from 'classnames';
import { ConstructionStatementEntry } from './types';
import { EstimationStatement } from '@/Domain/Service';

export type ConstructionStatementTabContentProps = {
    isDesignChange: boolean;
    construction: Construction;
    previousConstructionStatements: ConstructionStatement[];
    constructionStatementEntries: ConstructionStatementEntry[];
    previousConstructionStatementToEstimationStatementMap: Map<
        ConstructionStatement,
        EstimationStatement
    >;
    projects: Partial<Project>[];
};

const ConstructionStatementTabContent: FC<
    ConstructionStatementTabContentProps
> = ({
    isDesignChange,
    construction,
    previousConstructionStatements,
    constructionStatementEntries,
    previousConstructionStatementToEstimationStatementMap,
    projects,
}) => {
    return (
        <Table>
            <thead>
                <tr>
                    <th
                        className={classnames({
                            'd-none': !isDesignChange,
                        })}
                    >
                        前回 (落札率:
                        {construction.latestContract.rate.toLocaleString()})
                    </th>
                    <th>名前</th>
                    <th>工事工期</th>
                    <th>資産 or 費用</th>
                    <th>PJコード</th>
                </tr>
            </thead>
            <tbody>
                {constructionStatementEntries.map(
                    (
                        {
                            previousConstructionStatement,
                            estimationStatement,
                            formValue: { classification, projectCode },
                            onChangePreviousConstructionStatement,
                            changeFormValue,
                            errors,
                            term,
                        },
                        index,
                    ) => (
                        <tr key={index}>
                            <td
                                className={classnames({
                                    'd-none': !isDesignChange,
                                })}
                            >
                                <Form.Group>
                                    <Form.Control
                                        as='select'
                                        disabled={isNil(estimationStatement)}
                                        value={
                                            previousConstructionStatement?.name
                                        }
                                        onChange={
                                            onChangePreviousConstructionStatement
                                        }
                                    >
                                        <option>なし</option>
                                        {previousConstructionStatements
                                            .filter(
                                                cs =>
                                                    cs ===
                                                        previousConstructionStatement ||
                                                    !previousConstructionStatementToEstimationStatementMap.has(
                                                        cs,
                                                    ),
                                            )
                                            .map((v, i) => (
                                                <option key={i} value={v.name}>
                                                    {v.name}
                                                </option>
                                            ))}
                                    </Form.Control>
                                </Form.Group>
                            </td>
                            <td>
                                {errors.length > 0 && (
                                    <>
                                        <HoverErrorPopup
                                            content={errors.join('\n')}
                                        />
                                    </>
                                )}
                                {estimationStatement?.name ||
                                    previousConstructionStatement?.name}
                            </td>
                            <td>
                                {term
                                    ? DateTime.fromJSDate(term).toFormat(
                                          'yyyy/MM/dd',
                                      )
                                    : '----/--/--'}
                            </td>
                            <td>
                                <Form.Group>
                                    <Form.Control
                                        as='select'
                                        value={classification}
                                        isInvalid={!classification}
                                        onChange={e =>
                                            changeFormValue(
                                                'classification',
                                                e.target.value,
                                            )
                                        }
                                    >
                                        <option value=''>
                                            選択してください
                                        </option>
                                        <option value={Classification.Asset}>
                                            資産
                                        </option>
                                        <option value={Classification.Cost}>
                                            費用
                                        </option>
                                    </Form.Control>
                                </Form.Group>
                            </td>
                            <td>
                                <Form.Group>
                                    <Form.Control
                                        as='select'
                                        value={projectCode}
                                        isInvalid={!projectCode}
                                        onChange={e => {
                                            changeFormValue(
                                                'projectCode',
                                                e.target.value,
                                            );
                                        }}
                                    >
                                        <option value=''>
                                            選択してください
                                        </option>
                                        {projects.map(
                                            ({ code, name }, index) => (
                                                <option
                                                    key={index}
                                                    value={code}
                                                >
                                                    {code} : {name}
                                                </option>
                                            ),
                                        )}
                                    </Form.Control>
                                </Form.Group>
                            </td>
                        </tr>
                    ),
                )}
            </tbody>
        </Table>
    );
};

export default ConstructionStatementTabContent;
