import { SapFixedAssetRepository } from '@/Domain/Repository';
import axios from 'axios';
import React, { FC, useState, FormEventHandler, ChangeEvent } from 'react';
import { Modal, Form, Button, ModalProps } from 'react-bootstrap';

export const SapFixedAssetEditModal: FC<ModalProps> = ({ ...modalProps }) => {
    const [sapFixedAssetFile, setSapFixedAssetFile] = useState<File>();
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        setIsUploading(true);
        if (!sapFixedAssetFile)
            throw new Error('SAP固定資産台帳CSVがアップロードされていません');
        try {
            await SapFixedAssetRepository.create(sapFixedAssetFile);
            setIsUploading(false);
            location.reload();
        } catch (e) {
            setIsUploading(false);
            if (axios.isAxiosError(e)) {
                if (e.response?.status === 400) {
                    alert(
                        `SAP固定資産台帳のアップロードに失敗しました\n${JSON.stringify(
                            e.response.data,
                        )}`,
                    );
                    return;
                }
            } else alert('SAP固定資産台帳のアップロードが完了しませんでした');
        }
    };

    return (
        <Modal {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>マスタ一括アップロード</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.File>
                            <Form.File.Label>
                                SAP固定資産台帳CSV
                            </Form.File.Label>
                            <Form.File.Input
                                required
                                accept='.csv'
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    e.target.files &&
                                    setSapFixedAssetFile(e.target.files[0])
                                }
                            />
                        </Form.File>
                    </Form.Group>
                    <div className='d-flex justify-content-end'>
                        <Button type='submit' disabled={isUploading}>
                            {isUploading ? 'アップロード中' : '登録'}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    );
};
