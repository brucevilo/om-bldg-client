import { Design, MigrationStatus } from '@/Domain/Entity';
import { PagingButtons } from '@/Presentation/Component';
import { MigrationStatusBadge } from '@/Presentation/Component/MigrationStatusBadge';
import { MigrationStatusButton } from '@/Presentation/Component/MigrationStatusButton';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import { MigratedDesignRepository } from '../apps/repositories/DesignRepository';

interface Props {
    migratedDesigns: Design[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}
interface DesignRowProps {
    design: Design;
}

const TableHead: FC = () => (
    <tr>
        <th style={{ width: '100px' }}>ステータス</th>
        <th style={{ width: '500px' }}>設計名</th>
        <th style={{ width: '100px' }}></th>
    </tr>
);

const DesignRow: FC<DesignRowProps> = props => {
    const router = useRouter();
    return (
        <tr>
            <td>
                {<MigrationStatusBadge status={props.design.migrationStatus} />}
            </td>
            <td>{props.design.name}</td>
            <td>
                {
                    <MigrationStatusButton
                        status={props.design.migrationStatus}
                        onClickFunction={() => {
                            props.design.id &&
                                MigratedDesignRepository.updateMigratedDesign(
                                    props.design.id,
                                    MigrationStatus.InProgress,
                                );
                            router.push(
                                `/migrations/designs/${props.design.id}`,
                            );
                        }}
                    />
                }
            </td>
        </tr>
    );
};

export const MigratedDesignsTabTable: FC<Props> = props => {
    return (
        <div className='table-responsive'>
            <div className='d-flex justify-content-between mb-3'>
                <Table>
                    <thead>
                        <TableHead />
                    </thead>
                    <tbody>
                        {props.migratedDesigns.map(design => (
                            <DesignRow key={design.id} design={design} />
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
