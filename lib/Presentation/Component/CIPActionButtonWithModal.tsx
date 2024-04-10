import { Contract, Construction } from '@/Domain/Entity';
import React, { FC, useState } from 'react';
import { Button } from 'react-bootstrap';
import { CIPStartModal } from './CIPStartModal';

export const CIPActionButtonWithModal: FC<{
    contract: Contract;
    construction: Construction;
}> = ({ contract, construction }) => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Button
                className={'mr-2 bg-white text-dark border'}
                onClick={() => setShowModal(true)}
            >
                建仮精算
            </Button>
            <CIPStartModal
                show={showModal}
                onHide={() => setShowModal(false)}
                contract={contract}
                construction={construction}
            />
        </>
    );
};
