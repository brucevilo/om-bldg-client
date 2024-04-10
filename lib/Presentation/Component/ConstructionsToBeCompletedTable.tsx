import React, { useContext, useState, useEffect, FC } from 'react';
import NLink from 'next/link';
import { Table, Badge } from 'react-bootstrap';
import { Construction, ConstructionStatement } from '@/Domain/Entity';
import { ConstructionStatementRepository } from '@/Domain/Repository';
import { ConstructionActionButton } from '@/Presentation/Component';
import { MasterContext } from '@/Presentation/Context';
import { DateTime } from 'luxon';

const toBeCompletedThisMonth = (construction: Construction) => {
    return (
        construction?.latestContract?.endAt?.getMonth() ===
        new Date().getMonth()
    );
};

type Props = {
    constructions: Construction[];
};

export const ConstructionsToBeCompletedTable: FC<Props> = ({
    constructions,
}) => {
    const { users } = useContext(MasterContext);
    const [constructionStatements, setConstructionStatements] = useState<
        ConstructionStatement[]
    >([]);

    const fetchData = async () => {
        const css = await ConstructionStatementRepository.listByConstructions(
            constructions.map(c => c.id as number),
        );
        setConstructionStatements(css);
    };
    useEffect(() => {
        fetchData();
    }, []);
    return (
        <div className='table-responsive'>
            <Table hover>
                <thead>
                    <tr>
                        <th style={{ width: '100px' }}>ステータス</th>
                        <th style={{ width: '50px' }}>ID</th>
                        <th style={{ width: '300px' }}>工事名称</th>
                        <th style={{ width: '100px' }}>担当者</th>
                        <th style={{ width: '100px' }}>工事工期</th>
                        <th style={{ width: '100px' }}>検収予定日</th>
                        <th style={{ width: '200px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {constructions
                        .sort((a, b) => (b.id || 0) - (a.id || 0))
                        .filter(c => toBeCompletedThisMonth(c))
                        .map(c => {
                            const constructionStatement =
                                constructionStatements.find(
                                    cs => cs.contractId === c.latestContract.id,
                                );

                            return (
                                <tr key={c.id}>
                                    <td>
                                        {c.contracts.length > 1 && (
                                            <Badge
                                                variant='info'
                                                className='mr-2'
                                            >
                                                設計変更
                                            </Badge>
                                        )}
                                        {c.latestContract.completedAt ? (
                                            <Badge
                                                variant='info'
                                                className='mr-2'
                                            >
                                                工事完了
                                            </Badge>
                                        ) : (
                                            constructionStatements.find(
                                                cs =>
                                                    cs.contractId ===
                                                        c.latestContract.id &&
                                                    cs.isConstructionInProgressCompleted,
                                            ) && (
                                                <Badge
                                                    variant='info'
                                                    className='mr-2'
                                                >
                                                    一部完成
                                                </Badge>
                                            )
                                        )}
                                    </td>
                                    <td>{c.id}</td>
                                    <td>
                                        <NLink
                                            href='/constructions/[id]/summary'
                                            as={`/constructions/${c.id}/summary`}
                                        >
                                            {c.name}
                                        </NLink>
                                    </td>
                                    <td>
                                        {users.find(
                                            u =>
                                                u.id ===
                                                c.latestContract
                                                    .constructionStaffId,
                                        )?.name || '-'}
                                    </td>
                                    <td>
                                        {c.latestContract.endAt
                                            ? DateTime.fromJSDate(
                                                  c.latestContract.endAt,
                                              ).toFormat('yyyy/MM/dd')
                                            : '-'}
                                    </td>
                                    <td>
                                        {constructionStatement?.scheduledAcceptanceDate
                                            ? DateTime.fromJSDate(
                                                  constructionStatement.scheduledAcceptanceDate,
                                              ).toFormat('yyyy/MM/dd')
                                            : '---'}
                                    </td>
                                    <td className='text-right'>
                                        <ConstructionActionButton
                                            construction={c}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </Table>
        </div>
    );
};
