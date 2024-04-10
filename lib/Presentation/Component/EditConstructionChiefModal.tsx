import { Contract } from '@/Domain/Entity';
import { ContractRepository } from '@/Domain/Repository';
import React, { FC, FormEventHandler, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { StaffSelector } from './StaffSelector';

export const EditConstructionChiefModal: FC<
    { contract: Contract } & ModalProps
> = ({ contract, ...modalProps }) => {
    const [constructionChiefId, setConstructionChiefId] = useState(
        contract.constructionChiefId || 0,
    );
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await ContractRepository.updateStaff(contract.id, {
            constructionChiefId,
        });
        location.reload();
    };
    return (
        <Modal {...modalProps}>
            <Modal.Header>
                <Modal.Title>設計編集</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>工事担当者</Form.Label>
                        <StaffSelector
                            required
                            value={constructionChiefId.toString()}
                            onChange={id => setConstructionChiefId(id)}
                        />
                    </Form.Group>
                    <div className='text-right'>
                        <Button type='submit' variant='outline-dark'>
                            更新
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
