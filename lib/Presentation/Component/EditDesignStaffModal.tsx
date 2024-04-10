import { Contract } from '@/Domain/Entity';
import { ContractRepository } from '@/Domain/Repository';
import React, { FC, FormEventHandler, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { StaffSelector } from './StaffSelector';

export const EditDesignStaffModal: FC<{ contract: Contract } & ModalProps> = ({
    contract,
    ...modalProps
}) => {
    const [designStaffId, setDesignStaffId] = useState(
        contract.designStaffId || 0,
    );
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await ContractRepository.updateStaff(contract.id, { designStaffId });
        location.reload();
    };
    return (
        <Modal {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>設計編集</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>設計担当者</Form.Label>
                        <StaffSelector
                            required
                            value={designStaffId.toString()}
                            onChange={id => setDesignStaffId(id)}
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
