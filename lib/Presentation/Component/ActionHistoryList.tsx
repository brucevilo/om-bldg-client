import { ActionHistory } from '@/Domain/Entity';
import { DateTime } from 'luxon';
import React, { FC, Fragment, HTMLProps } from 'react';
import { Table } from 'react-bootstrap';

interface Props extends HTMLProps<HTMLDivElement> {
    actionHistories: ActionHistory[];
}

const CircleTh: FC<{ latest: boolean; oldest?: boolean }> = ({
    latest,
    oldest,
}) => (
    <td className='border-0 p-0'>
        <div className='w-100 d-flex justify-content-center align-items-center'>
            <svg width={16} viewBox='0 0 16 48'>
                {!oldest && (
                    <line x1='8' y1='24' x2='8' y2='48' stroke='#CCCCCC' />
                )}
                {!latest && (
                    <line x1='8' y1='0' x2='8' y2='24' stroke='#CCCCCC' />
                )}
                <circle
                    cx='8'
                    cy='24'
                    r='8'
                    fill={latest ? '#3273DC' : '#CCCCCC'}
                />
            </svg>
        </div>
    </td>
);

export const ActionHistoryList: FC<Props> = ({
    className,
    actionHistories,
}) => {
    const actions = actionHistories.reverse().map((history, index) => {
        return (
            <Fragment key={index}>
                <tr>
                    <CircleTh
                        latest={index === 0}
                        oldest={index === actionHistories.length - 1}
                    />
                    <td className='border-0'>{history.details}</td>
                    <td className='border-0'>{history.user.name}</td>
                    <td className='border-0 text-right'>
                        {DateTime.fromJSDate(history.createdAt).toFormat(
                            'yyyy年MM月dd日',
                        )}
                    </td>
                </tr>
            </Fragment>
        );
    });
    return (
        <div className={className}>
            <Table hover striped>
                <thead>
                    <tr>
                        <th
                            style={{ width: '64px' }}
                            className='border-top-0'
                        />
                        <th className='border-top-0' />
                        <th className='border-top-0'>担当者</th>
                        <th className='text-right border-top-0'>処理日</th>
                    </tr>
                </thead>
                <tbody>{actions}</tbody>
            </Table>
        </div>
    );
};
