import React, { useContext, FC } from 'react';
import NLink from 'next/link';
import { Table, Badge } from 'react-bootstrap';
import { Design } from '@/Domain/Entity';
import { DesignActionButton } from '@/Presentation/Component';
import { MasterContext } from '@/Presentation/Context';
import { DateTime } from 'luxon';

const toBeCompletedThisMonth = (design: Design) => {
    return design?.latestContract?.endAt?.getMonth() === new Date().getMonth();
};

type Props = {
    designs: Design[];
};

export const DesignsToBeCompletedTable: FC<Props> = ({ designs }) => {
    const { users } = useContext(MasterContext);

    return (
        <div className='table-responsive'>
            <Table hover>
                <thead>
                    <tr>
                        <th style={{ width: '100px' }}>ステータス</th>
                        <th style={{ width: '50px' }}>ID</th>
                        <th style={{ width: '300px' }}>設計名称</th>
                        <th style={{ width: '100px' }}>担当者</th>
                        <th style={{ width: '100px' }}>履行期限</th>
                        <th style={{ width: '100px' }}></th>
                        <th style={{ width: '200px' }}></th>
                    </tr>
                </thead>
                <tbody>
                    {designs
                        .sort((a, b) => (b.id || 0) - (a.id || 0))
                        .filter(d => toBeCompletedThisMonth(d))
                        .map(d => {
                            return (
                                <tr key={d.id}>
                                    <td>
                                        {d.contracts.length > 1 && (
                                            <Badge
                                                variant='info'
                                                className='mr-2'
                                            >
                                                設計変更
                                            </Badge>
                                        )}
                                        {d.latestContract.completedAt && (
                                            <Badge
                                                variant='info'
                                                className='mr-2'
                                            >
                                                設計完了
                                            </Badge>
                                        )}
                                    </td>
                                    <td>{d.id}</td>
                                    <td>
                                        <NLink
                                            href='/designs/[id]/summary'
                                            as={`/designs/${d.id}/summary`}
                                        >
                                            {d.name}
                                        </NLink>
                                    </td>
                                    <td>
                                        {users.find(
                                            u =>
                                                u.id ===
                                                d.latestContract.designStaffId,
                                        )?.name || '-'}
                                    </td>
                                    <td>
                                        {d.latestContract.endAt
                                            ? DateTime.fromJSDate(
                                                  d.latestContract.endAt,
                                              ).toFormat('yyyy/MM/dd')
                                            : '-'}
                                    </td>
                                    <td></td>
                                    <td className='text-right'>
                                        <DesignActionButton design={d} />
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </Table>
        </div>
    );
};
