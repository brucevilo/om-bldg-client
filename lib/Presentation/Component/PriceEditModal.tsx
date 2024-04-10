import React, { FC, useState, FormEventHandler } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { EditPriceForm, EditPrice } from '@/App/Service';
import { PriceRepository } from '@/Domain/Repository';
import { NumberInput } from './NumberInput';

interface PriceEditModalProps extends ModalProps {
    selectPriceForm: EditPriceForm;
}

export const PriceEditModal: FC<PriceEditModalProps> = ({
    selectPriceForm,
    onHide,
    ...modalProps
}) => {
    const [editPriceForm, setEditPriceForm] =
        useState<EditPriceForm>(selectPriceForm);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await PriceRepository.store(EditPrice.formToPrice(editPriceForm));
        location.reload();
    };

    return (
        <Modal {...modalProps} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>単価表マスタ追加</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>単価コード</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='単価コード入力してください'
                            value={editPriceForm.code}
                            onChange={e =>
                                setEditPriceForm({
                                    ...editPriceForm,
                                    code: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>名称</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='名称を入力してください'
                            value={editPriceForm.name}
                            onChange={e =>
                                setEditPriceForm({
                                    ...editPriceForm,
                                    name: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>形状寸法</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='形状寸法を入力してください。'
                            value={editPriceForm.shapeDimension}
                            onChange={e =>
                                setEditPriceForm({
                                    ...editPriceForm,
                                    shapeDimension: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>単価</Form.Label>
                        <NumberInput
                            required
                            className='form-control'
                            placeholder='単価を入力してください。'
                            value={editPriceForm.price}
                            onChange={e =>
                                setEditPriceForm({
                                    ...editPriceForm,
                                    price: e,
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
