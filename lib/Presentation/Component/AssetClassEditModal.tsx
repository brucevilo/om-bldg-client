import React, { FC, useState, FormEventHandler } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { EditAssetClassForm, EditAssetClass } from '@/App/Service';
import { AssetClassRepository } from '@/Domain/Repository';

interface AssetClassEditModalProps extends ModalProps {
    selectAssetClassForm: EditAssetClassForm;
    onHide: () => void;
}

export const AssetClassEditModal: FC<AssetClassEditModalProps> = ({
    selectAssetClassForm,
    onHide,
    ...modalProps
}) => {
    const [editAssetClassForm, setEditAssetClassForm] =
        useState<EditAssetClassForm>(selectAssetClassForm);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        await AssetClassRepository.store(
            EditAssetClass.formToAssetClass(editAssetClassForm),
        );
        location.reload();
    };

    return (
        <Modal {...modalProps} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>資産クラスマスタ追加</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>資産クラス名称</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='資産クラス名称を入力してください。'
                            value={editAssetClassForm.name}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    name: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>資産クラスコード</Form.Label>
                        <input
                            required
                            type='number'
                            className='form-control'
                            placeholder='資産クラスコードを入力してください。'
                            value={editAssetClassForm.code ?? ''}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    code: Number(e.target.value),
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>資産計上区分</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='資産計上区分を入力してください。'
                            value={editAssetClassForm.accountDivision}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    accountDivision: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>耐用年数</Form.Label>
                        <input
                            required
                            type='number'
                            className='form-control'
                            placeholder='耐用年数を入力してください。'
                            value={editAssetClassForm.usefulLife ?? ''}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    usefulLife: Number(e.target.value),
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>資産クラス名分類</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='資産クラス名分類を入力してください。'
                            value={editAssetClassForm.category}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    category: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>勘定科目「目」</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='勘定科目「目」を入力してください。'
                            value={editAssetClassForm.accountItemMoku}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    accountItemMoku: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>勘定科目「項」</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='勘定科目「項」を入力してください。'
                            value={editAssetClassForm.accountItemKou}
                            onChange={e =>
                                setEditAssetClassForm({
                                    ...editAssetClassForm,
                                    accountItemKou: e.target.value,
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
