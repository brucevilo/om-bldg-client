import { MigrationStatus } from '@/Domain/Entity';
import React, { FC } from 'react';
import { Button } from 'react-bootstrap';

interface Props {
    status: MigrationStatus;
    onClickFunction: () => void;
}

export const MigrationStatusButton: FC<Props> = props => {
    switch (props.status) {
        case MigrationStatus.Open:
            return (
                <Button onClick={() => props.onClickFunction()}>
                    ファイル登録
                </Button>
            );
        case MigrationStatus.InProgress:
            return (
                <Button onClick={() => props.onClickFunction()}>
                    ファイル登録
                </Button>
            );
        case MigrationStatus.Completed:
            return (
                <Button
                    onClick={() => props.onClickFunction()}
                    variant='outline-primary'
                >
                    再登録
                </Button>
            );
        default:
            return <Button>ステータスがありません</Button>;
    }
};
