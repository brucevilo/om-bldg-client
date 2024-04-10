import { Construction, MigrationStatus } from '@/Domain/Entity';
import { PagingButtons } from '@/Presentation/Component';
import { MigrationStatusBadge } from '@/Presentation/Component/MigrationStatusBadge';
import { MigrationStatusButton } from '@/Presentation/Component/MigrationStatusButton';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import { MigratedConstructionRepository } from '../apps/repositories/ConstructionRepository';

interface Props {
    migratedConstructions: Construction[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

interface ConstructionRowProps {
    construction: Construction;
}

const TableHead: FC = () => (
    <tr>
        <th style={{ width: '100px' }}>ステータス</th>
        <th style={{ width: '500px' }}>工事名</th>
        <th style={{ width: '100px' }}></th>
    </tr>
);

const ConstructionRow: FC<ConstructionRowProps> = props => {
    const router = useRouter();
    return (
        <tr>
            <td>
                {
                    <MigrationStatusBadge
                        status={props.construction.migrationStatus}
                    />
                }
            </td>
            <td>{props.construction.name}</td>
            <td>
                {
                    <MigrationStatusButton
                        status={props.construction.migrationStatus}
                        onClickFunction={() => {
                            props.construction.id &&
                                MigratedConstructionRepository.updateMigratedConstruction(
                                    props.construction.id,
                                    MigrationStatus.InProgress,
                                );
                            router.push(
                                `/migrations/constructions/${props.construction.id}`,
                            );
                        }}
                    />
                }
            </td>
        </tr>
    );
};

export const MigratedConstructionsTabTable: FC<Props> = props => {
    return (
        <div className='table-responsive'>
            <div className='d-flex justify-content-between mb-3'>
                <Table>
                    <thead>
                        <TableHead />
                    </thead>
                    <tbody>
                        {props.migratedConstructions.map(construction => (
                            <ConstructionRow
                                key={construction.id}
                                construction={construction}
                            />
                        ))}
                    </tbody>
                </Table>
            </div>
            <PagingButtons
                page={props.currentPage}
                totalPages={props.totalPages}
                onChangePage={i => props.setCurrentPage(i)}
            />
        </div>
    );
};
