import React, { FC, useState } from 'react';
import { Construction } from '@/Domain/Entity';
import { Button, Modal, FormGroup, FormLabel, Badge } from 'react-bootstrap';
import { CostDocumentErrorCheckListModal } from './CostDocumentErrorCheckListModal';
import { EstimationModal } from './EstimationModal';

export interface UploadDesignDocumentButtonWithModalProps {
    construction: Construction;
    onCompleteEstimation: () => void;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

export const UploadDesignDocumentButtonWithModal: FC<
    UploadDesignDocumentButtonWithModalProps
> = ({ construction, onCompleteEstimation, showModal, setShowModal }) => {
    const [costDocument, setCostDocument] = useState<File>();
    const [manageSheet, setManageSheet] = useState<File>();
    const [
        showCostDocumentErrorCheckListModal,
        setShowCostDocumentErrorCheckListModal,
    ] = useState<boolean>(false);
    const [showEstimationModal, setShowEstimationModal] = useState(false);

    return (
        <>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>
                        <span className='d-block'>内訳書</span>
                        <small className='text-secondary'>
                            {construction.name}
                        </small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            if (
                                construction.isContractChanged &&
                                manageSheet &&
                                !manageSheet.name.includes('発注価格')
                            ) {
                                alert(
                                    '積算登録金額反映後の工事管理シートをご使用ください',
                                );
                                return;
                            }

                            setShowModal(false);
                            setShowEstimationModal(true);
                        }}
                    >
                        <FormGroup>
                            <FormLabel>
                                <Badge variant='danger' className='mr-2'>
                                    必須
                                </Badge>
                                工事費内訳書
                            </FormLabel>
                            <input
                                className='form-control-file'
                                required
                                type='file'
                                onChange={e =>
                                    e.target.files &&
                                    e.target.files[0] &&
                                    setCostDocument(e.target.files[0])
                                }
                            />
                        </FormGroup>
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
                        <FormGroup>
                            <FormLabel>
                                <Badge variant='danger' className='mr-2'>
                                    必須
                                </Badge>
                                工事管理シート
                            </FormLabel>
                            <input
                                className='form-control-file'
                                required
                                type='file'
                                onChange={e =>
                                    e.target.files &&
                                    e.target.files[0] &&
                                    setManageSheet(e.target.files[0])
                                }
                            />
                        </FormGroup>
                        <div className='float-right'>
                            <Button
                                type='submit'
                                disabled={!costDocument}
                                variant='outline-dark'
                                className='mr-2'
                            >
                                積算登録 (β版)
                            </Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
            {costDocument && manageSheet && (
                <EstimationModal
                    show={showEstimationModal}
                    construction={construction}
                    costDocument={costDocument}
                    manageSheet={manageSheet}
                    onHide={() => setShowEstimationModal(false)}
                    onComplete={() => onCompleteEstimation()}
                    isDesignChange={construction.contracts.length > 1}
                    previousContract={construction.prevContract}
                    isFirstContractChange={construction.contracts.length === 2}
                    withinDesignChange={false}
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
