import { ChecklistGroup } from '@/Domain/ValueObject';
import React, { FC } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Session } from '@/Domain/Entity';

interface Props {
    checkedGroups: ChecklistGroup[];
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    onSubmit: () => void;
    session: Session | false | null;
}

export const AssetChecklistModal: FC<Props> = ({
    checkedGroups,
    setShowModal,
    showModal,
    onSubmit,
    session,
}) => {
    const CheckedCostItemWithAssetStatement = () => {
        const today = new Date();
        const sessionUser = session ? session.user : null;
        return (
            <div className='mb-3'>
                <h5 className='text-weight-bold mb-4'>現物照合一覧</h5>
                {checkedGroups.map(group => (
                    <div key={group.sapFixedAsset.id} className='mb-4'>
                        <ul className='list-unstyled'>
                            <li className='border-bottom py-2'>
                                {group.sapFixedAsset.assetName}
                            </li>
                        </ul>
                    </div>
                ))}
                <ul className='list-unstyled'>
                    <li className='border-bottom py-2'>
                        現物照合日：
                        {today.getFullYear() +
                            '/' +
                            (today.getMonth() + 1) +
                            '/' +
                            today.getDate()}
                    </li>
                    <li className='border-bottom py-2'>
                        現物照合担当者：{sessionUser?.name}
                    </li>
                </ul>
            </div>
        );
    };
    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>現物照合レポート</Modal.Header>
            <Modal.Body>
                <CheckedCostItemWithAssetStatement />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={onSubmit}
                    variant='light'
                    className='bg-white border'
                >
                    現物照合を完了する
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
