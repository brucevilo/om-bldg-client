import React, { FC, useState, FormEventHandler } from 'react';
import { ModalProps, Modal, Form, Button } from 'react-bootstrap';
import { PriceRepository } from '@/Domain/Repository';

export const PriceCsvModal: FC<ModalProps> = ({ onHide, ...modalProps }) => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const handleFileChanged = (e: React.ChangeEvent) => {
        const target: HTMLInputElement = e.target as HTMLInputElement;
        const file = target.files && target.files.item(0);
        file && setCsvFile(file);
    };
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        csvFile && (await PriceRepository.storeCsv(csvFile));
        location.reload();
    };

    return (
        <Modal {...modalProps} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>単価表マスタ CSV 一括登録</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>
                            指定された形式の CSV で単価表マスタを一括登録します
                        </Form.Label>
                        <input
                            required
                            type='file'
                            onChange={e => handleFileChanged(e)}
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
