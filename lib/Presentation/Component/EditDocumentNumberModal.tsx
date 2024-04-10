import { Construction } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import React, { FC, FormEventHandler, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';

export const EditDocumentNumberModal: FC<
    { construction: Construction } & ModalProps
> = ({ construction, ...modalProps }) => {
    const [newDocumentNumber, setNewDocumentNumber] = useState<string>(
        construction.documentNumber.value,
    );
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await ConstructionRepository.updateDocumentNumber(
            construction.id || 0,
            newDocumentNumber,
        );
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
                        <Form.Label htmlFor='disabledTextInput'>
                            設計書番号
                        </Form.Label>
                        <Form.Control
                            required
                            placeholder='設計書番号を入力して下さい。'
                            value={newDocumentNumber}
                            onChange={e => setNewDocumentNumber(e.target.value)}
                            pattern='\d{8}'
                            title='設計書番号は数字８桁で入力してください'
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
