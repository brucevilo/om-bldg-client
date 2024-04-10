import { MigrationStatus } from '@/Domain/Entity';
import React, { FC } from 'react';
import { Badge } from 'react-bootstrap';

interface Props {
    status: MigrationStatus;
}

export const MigrationStatusBadge: FC<Props> = props => {
    switch (props.status) {
        case MigrationStatus.Open:
            return (
                <Badge className='p-2' variant='danger'>
                    未移行
                </Badge>
            );
        case MigrationStatus.InProgress:
            return (
                <Badge className='p-2' variant='info'>
                    移行途中
                </Badge>
            );
        case MigrationStatus.Completed:
            return (
                <Badge className='p-2' variant='secondary'>
                    移行済
                </Badge>
            );
        default:
            return <div>ステータスがありません</div>;
    }
};
