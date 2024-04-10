import React, { FC, useContext } from 'react';
import { Badge, Button, Table } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Construction } from '@/Domain/Entity';
import { MasterContext } from '@/Presentation/Context';
import Link from 'next/link';

interface Props {
    constructions: Construction[];
}

export const ConstructionInProgress: FC<Props> = ({ constructions }) => {
    const { users } = useContext(MasterContext);

    const renderManager = (constructionChiefId: number | null) => {
        const constructionChief = users.find(
            user => user.id === constructionChiefId,
        );
        return constructionChief ? constructionChief.name : '--';
    };

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;

    const constructionsByCurrentMonth = constructions.filter(item => {
        const itemDate = new Date(
            item.contracts[0].constructionStatements[0]
                ?.scheduledAcceptanceDate as Date,
        );
        return itemDate.getMonth() + 1 === currentMonth;
    });
    const renderedButton = (nextAction: string) => {
        switch (nextAction) {
            case 'upload_cost_document':
                return '内訳書';
            case 'approval':
                return '設計書・稟議登録';
            case 'inquiry':
                return '契約伺い';
            case 'agreement':
                return '契約登録';
            case 'construction_in_progress':
                return '建仮';
            case 'retirement_and_construction_in_progress':
                return '建仮';
            case 'retirement':
                return '建仮';
        }
    };
    return (
        <div className='table-responsive'>
            <Table>
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>ステータス</th>
                        <th style={{ width: '5%' }}>ID</th>
                        <th style={{ width: '33%' }}>工事名称</th>
                        <th style={{ width: '10%' }}>担当者</th>
                        <th style={{ width: '15%' }}>工事工期</th>
                        <th style={{ width: '15%' }}>検収予定日</th>
                        <th style={{ width: '12%' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {constructionsByCurrentMonth.map(construction => (
                        <tr key={construction.id}>
                            <td>
                                <Badge className='mr-2' variant='dark'>
                                    {construction.contracts.length &&
                                        '一部完成'}
                                </Badge>
                            </td>
                            <td>{construction.id}</td>
                            <td>
                                <Link
                                    href='/constructions/[id]/summary'
                                    as={`/constructions/${construction.id}/summary`}
                                >
                                    {construction.name}
                                </Link>
                            </td>
                            <td>
                                {renderManager(
                                    construction.contracts[0]
                                        .constructionChiefId,
                                )}
                            </td>
                            <td>
                                <span
                                    hidden={construction.contracts[0].constructionStatements.some(
                                        cs =>
                                            !cs.isConstructionInProgressCompleted,
                                    )}
                                >
                                    <FA
                                        icon={faCheckCircle}
                                        style={{ color: 'green' }}
                                    />
                                </span>
                                {DateTime.fromJSDate(
                                    construction.contracts[0].endAt as Date,
                                ).toFormat('yyyy/MM/dd')}
                            </td>
                            <td>
                                {DateTime.fromJSDate(
                                    construction.contracts[0]
                                        .constructionStatements[0]
                                        ?.scheduledAcceptanceDate as Date,
                                ).toFormat('yyyy/MM/dd')}
                            </td>
                            <td className='d-flex justify-content-end'>
                                <Link
                                    href='/constructions/[id]/summary'
                                    as={`/constructions/${construction.id}/summary`}
                                >
                                    <Button className='bg-white border btn btn-light'>
                                        {renderedButton(
                                            construction.contracts[0]
                                                .nextAction,
                                        )}
                                    </Button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};
