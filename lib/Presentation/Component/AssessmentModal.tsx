import React, { FC } from 'react';
import { Construction, Contract, Design } from '@/Domain/Entity';
import { ModalProps, Modal, Button, Spinner } from 'react-bootstrap';
import { AssessmentSheet } from './AssessmentSheet';
import { Assessment } from '@/Domain/ValueObject';

export interface AssessmentModalProps extends ModalProps {
    contractable: Construction | Design;
    contract: Contract;
    onComplete: () => void;
    assessment: Assessment;
    setAssessment: (assessment: Assessment) => void;
    isLoadingAssessment: boolean;
}

export const AssessmentModal: FC<AssessmentModalProps> = ({
    contractable,
    contract,
    onComplete,
    assessment,
    setAssessment,
    isLoadingAssessment,
    ...modalProps
}) => {
    if (!contract.contractedPrice) return null;
    return (
        <Modal {...modalProps} size='xl' className='noPrint'>
            <Modal.Header closeButton>
                <Modal.Title>
                    内訳明細書(
                    {contract.constructionId ? '工事用' : '設計業務委託用'})
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='border border-danger rounded bg-white p-3 mb-4'>
                    <ul className='text-danger mb-0'>
                        <li>内容にお間違えがないかお確かめください。</li>
                    </ul>
                </div>
                <AssessmentSheet
                    contractable={contractable}
                    contract={contract}
                    assessment={assessment}
                    setAssessment={setAssessment}
                />
            </Modal.Body>
            <Modal.Footer>
                <div className='text-right'>
                    {isLoadingAssessment ? (
                        <Button
                            variant='light'
                            className='bg-white border'
                            disabled
                        >
                            <Spinner
                                as='span'
                                animation='grow'
                                size='sm'
                                role='status'
                                aria-hidden='true'
                            />
                            Loading...
                        </Button>
                    ) : (
                        <Button
                            onClick={onComplete}
                            variant='light'
                            className='bg-white border'
                        >
                            確認
                        </Button>
                    )}
                </div>
            </Modal.Footer>
        </Modal>
    );
};
