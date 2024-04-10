import { Construction, Design, Project } from '@/Domain/Entity';
import React, { FC } from 'react';
import {
    Button,
    Form,
    FormGroup,
    FormLabel,
    Modal,
    ModalProps,
} from 'react-bootstrap';

export const DeleteDataModal: FC<
    { onDelete: React.FormEventHandler } & {
        ableDelete: boolean;
    } & { data: Project | Design | Construction } & {
        onHide: () => void;
    } & ModalProps
> = ({ onDelete, ableDelete, data, ...modalProps }) => {
    return (
        <Modal {...modalProps}>
            <Modal.Header
                style={{ backgroundColor: '#666666', color: 'white' }}
            >
                <Modal.Title>削除確認</Modal.Title>
                <p
                    style={{
                        backgroundColor: '#333333',
                        border: '1px solid #333333',
                        borderRadius: '50%',
                        height: '25px',
                        width: '25px',
                        textAlign: 'center',
                        lineHeight: '25px',
                        cursor: 'pointer',
                        position: 'relative',
                        top: '10px',
                    }}
                    onClick={() => modalProps.onHide()}
                >
                    ×
                </p>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onDelete}>
                    {ableDelete ? (
                        <>
                            <FormGroup>
                                <FormLabel>
                                    「{data.name}
                                    」を削除します。
                                    <br />
                                    本当によろしいでしょうか？
                                </FormLabel>
                                <p>＊この操作は取消は行えません。</p>
                            </FormGroup>
                            <div className='text-right'>
                                <Button
                                    className='border'
                                    variant='light'
                                    onClick={() => modalProps.onHide()}
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    type='submit'
                                    variant='light'
                                    style={{
                                        color: 'red',
                                        borderColor: 'red',
                                        marginLeft: '15px',
                                    }}
                                >
                                    削除
                                </Button>
                            </div>
                        </>
                    ) : (
                        <Form.Group>
                            <FormLabel>
                                他のデータ(事業、設計、工事)との紐づきがあります。削除したい場合は、管理者にお問い合わせ下さい。
                            </FormLabel>
                            <div className='text-right'>
                                <Button
                                    variant='light'
                                    onClick={() => modalProps.onHide()}
                                >
                                    了解
                                </Button>
                            </div>
                        </Form.Group>
                    )}
                </Form>
            </Modal.Body>
        </Modal>
    );
};
