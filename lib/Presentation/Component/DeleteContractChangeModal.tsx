import { Construction, Design } from '@/Domain/Entity';
import { ConstructionRepository, DesignRepository } from '@/Domain/Repository';
import React, { FC, FormEvent } from 'react';
import {
    Button,
    Form,
    FormGroup,
    FormLabel,
    Modal,
    ModalProps,
} from 'react-bootstrap';

interface Props extends ModalProps {
    contractable: Construction | Design;
    onHide: () => void;
}

export const DeleteContractChangeModal: FC<Props> = ({
    contractable,
    ...modalProps
}) => {
    const onDeleteContractChange = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (contractable.latestContract.constructionId) {
                await ConstructionRepository.deleteContractChange(
                    contractable.id || 0,
                );
            } else {
                await DesignRepository.deleteContractChange(
                    contractable.id || 0,
                );
            }
        } catch {
            alert('一回でも除却や建仮精算をしている場合は変更できません');
        }
        modalProps.onHide();
    };

    return (
        <Modal {...modalProps}>
            <Modal.Header
                style={{ backgroundColor: '#666666', color: 'white' }}
                closeButton
            >
                <Modal.Title>変更確認</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onDeleteContractChange}>
                    <FormGroup>
                        <FormLabel>
                            「{contractable.name}
                            」を契約変更前に戻します。
                            <br />
                            本当によろしいでしょうか？
                        </FormLabel>
                        <p>＊この操作は取消は行えません。</p>
                    </FormGroup>
                    <div className='text-right'>
                        <Button
                            className='border'
                            variant='light'
                            onClick={modalProps.onHide}
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
                            変更する
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
