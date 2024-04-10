import React, { FC, useState, FormEventHandler } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { EditUserForm } from '@/App/Service';
import { UserRepository } from '@/Domain/Repository';

interface UserEditModalProps extends ModalProps {
    selectUserForm: EditUserForm;
}

export const UserEditModal: FC<UserEditModalProps> = ({
    selectUserForm,
    onHide,
    isNew,
    isSelf,
    byAdmin,
    ...modalProps
}) => {
    const [editUserForm, setEditUserForm] =
        useState<EditUserForm>(selectUserForm);
    const [changePassword, setChangePassword] = useState(false);
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        if (
            editUserForm.password &&
            editUserForm.password !== editUserForm.passwordConfirmation
        ) {
            alert('パスワードとパスワード確認が異なります。');
            return;
        }
        await UserRepository.store(editUserForm);
        location.reload();
    };

    return (
        <Modal {...modalProps} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isNew ? 'ユーザー追加' : 'ユーザー編集'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>氏名</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='氏名を入力してください。'
                            value={editUserForm.name}
                            onChange={e =>
                                setEditUserForm({
                                    ...editUserForm,
                                    name: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>氏名コード</Form.Label>
                        <input
                            className='form-control'
                            placeholder='氏名コードを入力してください。'
                            value={editUserForm.nameCode}
                            type='text'
                            onChange={e =>
                                setEditUserForm({
                                    ...editUserForm,
                                    nameCode: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>部署</Form.Label>
                        <input
                            className='form-control'
                            placeholder='部署を入力してください。'
                            value={editUserForm.department}
                            onChange={e =>
                                setEditUserForm({
                                    ...editUserForm,
                                    department: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>メールアドレス</Form.Label>
                        <input
                            required
                            className='form-control'
                            placeholder='メールアドレスを入力してください。'
                            value={editUserForm.email}
                            onChange={e =>
                                setEditUserForm({
                                    ...editUserForm,
                                    email: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    {!isNew && (
                        <>
                            パスワードを変更する
                            <input
                                className='form-switch'
                                type='checkbox'
                                checked={changePassword}
                                onChange={e => {
                                    setChangePassword(e.target.checked);
                                    if (!e.target.checked) {
                                        setEditUserForm({
                                            ...editUserForm,
                                            password: '',
                                            passwordConfirmation: '',
                                        });
                                    }
                                }}
                            />
                        </>
                    )}
                    {(isNew || changePassword) && (
                        <>
                            <Form.Group>
                                <Form.Label>パスワード</Form.Label>
                                <input
                                    required
                                    className='form-control'
                                    placeholder='パスワードを入力してください。'
                                    value={editUserForm.password}
                                    type='password'
                                    onChange={e =>
                                        setEditUserForm({
                                            ...editUserForm,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>パスワード確認</Form.Label>
                                <input
                                    required
                                    className='form-control'
                                    placeholder='もう 1 度パスワードを入力してください。'
                                    value={editUserForm.passwordConfirmation}
                                    type='password'
                                    onChange={e =>
                                        setEditUserForm({
                                            ...editUserForm,
                                            passwordConfirmation:
                                                e.target.value,
                                        })
                                    }
                                />
                            </Form.Group>
                        </>
                    )}
                    <Form.Group>
                        <Form.Label>システム管理者権限</Form.Label>
                        <input
                            className='form-switch'
                            type='checkbox'
                            checked={editUserForm.admin}
                            disabled={!byAdmin || isSelf}
                            onChange={e =>
                                setEditUserForm({
                                    ...editUserForm,
                                    admin: Boolean(e.target.checked),
                                })
                            }
                        />
                        {byAdmin && isSelf && (
                            <Form.Text className='form-caution'>
                                自分自身の管理者権限を外すことはできません。
                            </Form.Text>
                        )}
                        {!byAdmin && (
                            <Form.Text className='form-caution'>
                                管理者権限の付与には、管理者の操作が必要です。
                            </Form.Text>
                        )}
                    </Form.Group>

                    <div className='d-flex justify-content-end'>
                        <Button className='mr-2' onClick={onHide}>
                            キャンセル
                        </Button>
                        <Button
                            disabled={editUserForm === selectUserForm}
                            type='submit'
                        >
                            保存する
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};
