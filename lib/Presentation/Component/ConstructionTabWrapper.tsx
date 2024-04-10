import { Construction } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import router from 'next/router';
import React, { FC, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Tabs } from '.';
import { DeleteDataModal } from './DeleteDataModal';

interface Props {
    id: number;
    construction: Construction;
    displayDeleteButton: boolean;
}

export const ConstructionTabWrapper: FC<Props> = ({
    id,
    construction,
    displayDeleteButton,
}) => {
    const [showDeleteDataModal, setShowDeleteDataModal] =
        useState<boolean>(false);

    const deleteConstruction: React.FormEventHandler = async e => {
        e.preventDefault();
        await ConstructionRepository.delete(construction);
        router.push('/constructions');
    };

    return (
        <div className='d-flex justify-content-between'>
            <Tabs
                className='my-4'
                items={[
                    {
                        href: '/constructions/[id]/summary',
                        as: `/constructions/${id}/summary`,
                        text: '概要',
                    },
                    {
                        href: '/constructions/[id]/documents',
                        as: `/constructions/${id}/documents`,
                        text: '内訳明細書',
                    },
                    {
                        href: '/constructions/[id]/estimation/construction_statements',
                        as: `/constructions/${id}/estimation/construction_statements`,
                        text: '積算登録',
                    },
                    {
                        href: '/constructions/[id]/approval',
                        as: `/constructions/${id}/approval`,
                        text: '設計・稟議',
                    },
                    {
                        href: '/constructions/[id]/contract_inquiry',
                        as: `/constructions/${id}/contract_inquiry`,
                        text: '契約伺い',
                    },
                    {
                        href: '/constructions/[id]/contract',
                        as: `/constructions/${id}/contract`,
                        text: '契約登録',
                    },
                    {
                        href: '/constructions/[id]/retirement_and_construction_in_progress',
                        as: `/constructions/${id}/retirement_and_construction_in_progress`,
                        text: '建仮精算・除却',
                    },
                    {
                        href: '/constructions/[id]/completed',
                        as: `/constructions/${id}/completed`,
                        text: '工事完了',
                    },
                    {
                        href: '/constructions/[id]/relations',
                        as: `/constructions/${id}/relations`,
                        text: '関連図',
                    },
                ]}
            />
            {displayDeleteButton && (
                <div style={{ position: 'relative', bottom: '20px' }}>
                    <Button
                        variant='light'
                        className='bg-white border py-2'
                        style={{ color: 'red', paddingRight: '70px' }}
                        onClick={() => setShowDeleteDataModal(true)}
                    >
                        削除する
                    </Button>
                </div>
            )}
            <DeleteDataModal
                onDelete={deleteConstruction}
                ableDelete={true}
                data={construction}
                show={showDeleteDataModal}
                onHide={() => setShowDeleteDataModal(false)}
            />
        </div>
    );
};
