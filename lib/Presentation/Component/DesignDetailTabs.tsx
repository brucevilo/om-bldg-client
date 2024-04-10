import { Construction, Design } from '@/Domain/Entity';
import { ConstructionRepository, DesignRepository } from '@/Domain/Repository';
import router from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Tabs } from '.';
import { DeleteDataModal } from './DeleteDataModal';

export const DesignDetailTabs: FC<{
    id: number;
    design: Design;
    displayDeleteButton: boolean;
}> = ({ id, design, displayDeleteButton }) => {
    const [constructions, setConstructions] = useState<Construction[]>();
    const [showDeleteDataModal, setShowDeleteDataModal] =
        useState<boolean>(false);

    const fetchData = async () => {
        setConstructions(await ConstructionRepository.listByDesign(design));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteDesign: React.FormEventHandler = async e => {
        e.preventDefault();
        await DesignRepository.delete(design);
        router.push('/designs');
    };

    return (
        <div className='d-flex justify-content-between'>
            <Tabs
                className='my-4'
                items={[
                    {
                        text: '概要',
                        href: `/designs/[id]/summary`,
                        as: `/designs/${id}/summary`,
                    },
                    {
                        text: '設計登録',
                        href: '/designs/[id]/details',
                        as: `/designs/${id}/details`,
                    },
                    {
                        text: '内訳明細書',
                        href: '/designs/[id]/documents',
                        as: `/designs/${id}/documents`,
                        isActive: url => url.includes('documents'),
                    },
                    {
                        text: '仕様書・稟議',
                        href: `/designs/[id]/approval`,
                        as: `/designs/${id}/approval`,
                    },
                    {
                        text: '契約伺い',
                        href: `/designs/[id]/contract_inquiry`,
                        as: `/designs/${id}/contract_inquiry`,
                    },
                    {
                        text: '契約登録',
                        href: `/designs/[id]/contract`,
                        as: `/designs/${id}/contract`,
                    },
                    {
                        text: '関連図',
                        href: '/designs/[id]/relations',
                        as: `/designs/${id}/relations`,
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
                onDelete={deleteDesign}
                ableDelete={constructions?.length === 0}
                data={design}
                show={showDeleteDataModal}
                onHide={() => setShowDeleteDataModal(false)}
            />
        </div>
    );
};
