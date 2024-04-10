import React, { FC, useState, FormEventHandler } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { EditDeflatorForm, EditDeflator } from '@/App/Service';
import { DeflatorRepository } from '@/Domain/Repository';

interface DeflatorEditModalProps extends ModalProps {
    selectDeflatorForm: EditDeflatorForm;
}

export const DeflatorEditModal: FC<DeflatorEditModalProps> = ({
    selectDeflatorForm,
    onHide,
    isNew,
    ...modalProps
}) => {
    const [editDeflatorForm, setEditDeflatorForm] =
        useState<EditDeflatorForm>(selectDeflatorForm);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await DeflatorRepository.store(
            EditDeflator.formToDeflate(editDeflatorForm),
        );
        location.reload();
    };

    return (
        <Modal {...modalProps} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isNew ? 'デフレート率追加' : 'デフレート率変更'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>年度</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='年度を入力してください。'
                            value={editDeflatorForm.year}
                            onChange={e =>
                                setEditDeflatorForm({
                                    ...editDeflatorForm,
                                    year: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>デフレート率</Form.Label>
                        <input
                            required
                            className='form-control'
                            type='number'
                            step='0.1'
                            placeholder='デフレート率を入力してください。'
                            value={editDeflatorForm.rate}
                            onChange={e =>
                                setEditDeflatorForm({
                                    ...editDeflatorForm,
                                    rate: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <div className='d-flex justify-content-end'>
                        <Button className='mr-2' onClick={onHide}>
                            キャンセル
                        </Button>
                        <Button type='submit'>保存する</Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};
