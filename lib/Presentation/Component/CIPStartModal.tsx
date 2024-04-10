import { Contract, Construction } from '@/Domain/Entity';
import { CIPRepository } from '@/Domain/Repository';
import { useRouter } from 'next/router';
import React, { ChangeEvent, FC, FormEventHandler, useState } from 'react';
import { Badge, Button, Form, Modal, ModalProps } from 'react-bootstrap';

export const CIPStartModal: FC<
    ModalProps & {
        contract: Contract;
        construction: Construction;
        onHide: () => void;
    }
> = ({ construction, contract, onHide, ...modalProps }) => {
    const [handoverDocument, setHandoverDocument] = useState<File>();
    const [manageSheet, setManageSheet] = useState<File>();
    const [memo, setMemo] = useState('');
    const router = useRouter();
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        if (!handoverDocument || !manageSheet) return;
        if (
            !manageSheet.name.includes('発注価格') &&
            !manageSheet.name.includes('建仮精算')
        ) {
            alert('契約登録後・精算後の工事管理シートをご使用ください');
            return;
        }
        await CIPRepository.create({
            contractId: contract.id,
            handoverDocument,
            manageSheet,
            memo,
        });
        onHide();
        router.push(
            `/constructions/${contract.constructionId}/construction_in_progress`,
        );
    };
    return (
        <Modal onHide={() => onHide()} {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>
                    <span className='d-block'>完成情報登録</span>
                    <small className='text-secondary'>
                        {construction.name}
                    </small>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>
                            <Badge variant='danger' className='mr-2'>
                                必須
                            </Badge>
                            工事情報引継書
                        </Form.Label>
                        <Form.File.Input
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                e.target.files &&
                                setHandoverDocument(e.target.files[0])
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>
                            <Badge variant='danger' className='mr-2'>
                                必須
                            </Badge>
                            工事管理シート
                        </Form.Label>
                        <Form.File.Input
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                e.target.files &&
                                setManageSheet(e.target.files[0])
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>メモ</Form.Label>
                        <Form.Control
                            as='textarea'
                            value={memo}
                            onChange={e => setMemo(e.target.value)}
                            placeholder='メモを入力してください。'
                        />
                    </Form.Group>
                    <div className='text-right'>
                        <Button
                            type='submit'
                            variant='light'
                            className='bg-white border'
                        >
                            登録
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
