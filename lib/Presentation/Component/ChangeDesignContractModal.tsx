import { Estimate } from '@/App/Service';
import { Design, Contract } from '@/Domain/Entity';
import { ContractRepository, DesignRepository } from '@/Domain/Repository';
import { CostDocument } from '@/Domain/ValueObject';
import { assertsIsExists, assertsIsNotNull, Excel } from '@/Infrastructure';
import React, { ChangeEvent, FC, FormEventHandler, useState } from 'react';
import {
    Badge,
    Form,
    Modal,
    ModalProps,
    Button,
    Spinner,
} from 'react-bootstrap';
import { UploadCostDocumentModalWarnings } from '@/Presentation/Component/UploadCostDocumentModalWarnings';

export const ChangeDesignContractModal: FC<
    ModalProps & {
        design: Design;
        onComplete: () => void;
        onHide: () => void;
    }
> = props => {
    const [costDocument, setCostDocument] = useState<File>();
    const [manageSheet, setManageSheet] = useState<File>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { design, onComplete, onHide, ...modalProps } = props;
    const contractBeforeChange = design.latestContract;
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        setIsLoading(true);
        assertsIsExists(costDocument, '内訳書が選択されていません');
        const costDocumentWorkBook = await Excel.read(costDocument);
        const costDocumentObject = new CostDocument(costDocumentWorkBook);
        const expectedPrice = costDocumentObject.totalPrice;
        const newContract = new Contract({
            designId: design.id,
            expectedPrice,
            costDocument,
            manageSheet,
            contractNumber: contractBeforeChange.contractNumber,
            startAt: contractBeforeChange.startAt,
            supplierId: contractBeforeChange.supplierId,
            bidMethod: contractBeforeChange.bidMethod,
            designChiefId: contractBeforeChange.designChiefId,
            designStaffId: contractBeforeChange.designStaffId,
            nextAction: 'approval',
        });
        await ContractRepository.create(newContract);
        assertsIsNotNull(newContract.designId);
        const newDesign = await DesignRepository.get(newContract.designId);
        await new Estimate(
            newDesign,
            costDocument,
            manageSheet as File,
        ).invoke();
        setIsLoading(false);
        onHide();
        onComplete();
    };
    return (
        <Modal onHide={() => onHide()} {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>内訳書</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.File>
                            <Form.File.Label>
                                <Badge variant='danger' className='mr-2'>
                                    必須
                                </Badge>
                                内訳書
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
                    <div className='d-flex justify-content-end'>
                        {isLoading ? (
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
                                type='submit'
                                variant='outline-dark'
                                disabled={!(costDocument && manageSheet)}
                            >
                                登録
                            </Button>
                        )}
                    </div>
                </Form>
                <UploadCostDocumentModalWarnings />
            </Modal.Body>
        </Modal>
    );
};
