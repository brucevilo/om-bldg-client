import React, { FC, useState, FormEventHandler } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { EditSupplierForm, EditSupplier } from '@/App/Service';
import { SupplierRepository } from '@/Domain/Repository';

interface SupplierEditModalProps extends ModalProps {
    selectSupplierForm: EditSupplierForm;
}

export const SupplierEditModal: FC<SupplierEditModalProps> = ({
    selectSupplierForm,
    onHide,
    ...modalProps
}) => {
    const [editSupplierForm, setEditSupplierForm] =
        useState<EditSupplierForm>(selectSupplierForm);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await SupplierRepository.store(
            EditSupplier.formToSupplier(editSupplierForm),
        );
        location.reload();
    };

    return (
        <Modal {...modalProps} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>業者マスタ追加</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>業者名</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='業者名を入力してください。'
                            value={editSupplierForm.name}
                            onChange={e =>
                                setEditSupplierForm({
                                    ...editSupplierForm,
                                    name: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>仕入れ先コード</Form.Label>
                        <input
                            required
                            className='form-control'
                            type='number'
                            placeholder='仕入れ先コードを入力してください。'
                            value={editSupplierForm.code}
                            onChange={e =>
                                setEditSupplierForm({
                                    ...editSupplierForm,
                                    code: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>業者連絡先</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='業者連絡先を入力してください。'
                            value={editSupplierForm.contact}
                            onChange={e =>
                                setEditSupplierForm({
                                    ...editSupplierForm,
                                    contact: e.target.value,
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
