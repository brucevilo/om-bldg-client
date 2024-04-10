import { Construction } from '@/Domain/Entity';
import React, { ChangeEvent, FC, FormEvent, useState } from 'react';
import { Badge, Form, Modal, ModalProps, Button } from 'react-bootstrap';
import { CostDocumentErrorCheckListModal } from './CostDocumentErrorCheckListModal';
import { EstimationModal } from './EstimationModal';

export const ChangeConstructionContractModal: FC<
    ModalProps & {
        construction: Construction;
        onComplete: () => void;
        onHide: () => void;
    }
> = props => {
    const [costDocument, setCostDocument] = useState<File>();
    const [manageSheet, setManageSheet] = useState<File>();
    const [
        showCostDocumentErrorCheckListModal,
        setShowCostDocumentErrorCheckListModal,
    ] = useState<boolean>(false);
    const [showEstimationModal, setShowEstimationModal] = useState(false);
    const { construction, onComplete, onHide, ...modalProps } = props;

    const onSubmitCostDocuments = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (manageSheet && !manageSheet.name.includes('発注価格')) {
            alert('契約登録金額反映後の工事管理シートをご使用ください');
            return;
        }
        onHide();
        if (costDocument && manageSheet) setShowEstimationModal(true);
    };

    return (
        <>
            <Modal onHide={() => onHide()} {...modalProps}>
                <Modal.Header>
                    <Modal.Title>内訳書{construction.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form
                        onSubmit={(e: FormEvent<HTMLFormElement>) => {
                            onSubmitCostDocuments(e);
                        }}
                    >
                        <Form.Group>
                            <Form.File>
                                <Form.File.Label>
                                    <Badge variant='danger' className='mr-2'>
                                        必須
                                    </Badge>
                                    工事費内訳書
                                </Form.File.Label>
                                <Form.File.Input
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        if (!e.target.files) return;
                                        setCostDocument(e.target.files[0]);
                                    }}
                                />
                            </Form.File>
                        </Form.Group>
                        <div
                            style={{
                                position: 'absolute',
                                left: '200px',
                                bottom: '140px',
                            }}
                        >
                            <Button
                                variant='link'
                                className='text-danger text-center'
                                size='sm'
                                disabled={!costDocument}
                                onClick={() =>
                                    setShowCostDocumentErrorCheckListModal(true)
                                }
                            >
                                チェックする
                            </Button>
                        </div>
                        <Form.Group>
                            <Form.File>
                                <Form.File.Label>
                                    <Badge variant='danger' className='mr-2'>
                                        必須
                                    </Badge>
                                    工事管理シート
                                </Form.File.Label>
                                <Form.File.Input
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) => {
                                        if (!e.target.files) return;
                                        setManageSheet(e.target.files[0]);
                                    }}
                                />
                            </Form.File>
                        </Form.Group>
                        <div className='float-right'>
                            <Button
                                type='submit'
                                disabled={!(costDocument && manageSheet)}
                                variant='outline-dark'
                                className='mr-2'
                            >
                                積算登録 (β版)
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
            {costDocument && manageSheet && showEstimationModal && (
                <EstimationModal
                    show={showEstimationModal}
                    construction={construction}
                    costDocument={costDocument}
                    manageSheet={manageSheet}
                    onHide={() => setShowEstimationModal(false)}
                    isDesignChange={true}
                    onComplete={() => {
                        setShowEstimationModal(false);
                        onComplete();
                    }}
                    previousContract={construction.latestContract}
                    isFirstContractChange={construction.contracts.length === 1}
                    withinDesignChange={true}
                />
            )}
            {costDocument && showCostDocumentErrorCheckListModal && (
                <CostDocumentErrorCheckListModal
                    show={showCostDocumentErrorCheckListModal}
                    onHide={() => setShowCostDocumentErrorCheckListModal(false)}
                    costDocument={costDocument}
                />
            )}
        </>
    );
};
