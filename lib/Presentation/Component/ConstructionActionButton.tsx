import React, { FC, useState, FormEventHandler } from 'react';
import { Construction } from '@/Domain/Entity';
import {
    Button,
    Modal,
    FormGroup,
    FormLabel,
    Badge,
    Spinner,
} from 'react-bootstrap';
import Link from 'next/link';
import { UploadDesignDocumentButtonWithModal } from './UploadDesignDocumentButtonWithModal';
import { ContractRepository } from '@/Domain/Repository';
import { CIPActionButtonWithModal } from './CIPActionButtonWithModal';
import { useRouter } from 'next/router';

interface Props {
    construction: Construction;
}

const buttonStyleClass = 'bg-white text-dark border';

export const ConstructionActionButton: FC<Props> = ({ construction }) => {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [isLoadingApproval, setIsLoadingApproval] = useState(false);
    const [showUploadDesignDocumentModal, setShowUploadDesignDocumentModal] =
        useState(false);
    const [updateApprovalState, setUpdateApprovalState] = useState<{
        id: number;
        approvalFile: File | null;
        approvalMemo: string;
        specFile: File | null;
    }>({
        id: construction.latestContract.id as number,
        approvalFile: null,
        approvalMemo: '',
        specFile: null,
    });
    const router = useRouter();

    const onSubmitApproval: FormEventHandler = async e => {
        e.preventDefault();
        setIsLoadingApproval(true);
        if (!updateApprovalState.approvalFile || !updateApprovalState.specFile)
            return;
        await ContractRepository.updateApproval({
            id: updateApprovalState.id,
            approvalFile: updateApprovalState.approvalFile,
            approvalMemo: updateApprovalState.approvalMemo,
            specFile: updateApprovalState.specFile,
        });
        setIsLoadingApproval(false);
        setShowApprovalModal(false);
        router.push('/constructions?next_action=inquiry');
    };
    const contract = construction.latestContract;
    if (contract.nextAction === 'upload_cost_document')
        return (
            <>
                <Button
                    onClick={() => setShowUploadDesignDocumentModal(true)}
                    className={buttonStyleClass}
                >
                    内訳書
                </Button>
                <UploadDesignDocumentButtonWithModal
                    construction={construction}
                    onCompleteEstimation={() =>
                        router.push('/constructions?next_action=approval')
                    }
                    showModal={showUploadDesignDocumentModal}
                    setShowModal={setShowUploadDesignDocumentModal}
                />
            </>
        );
    if (contract.nextAction === 'approval') {
        return contract.isProcessing ? (
            <Button
                onClick={() => alert('工事管理シート編集中です')}
                className={buttonStyleClass}
            >
                設計書・稟議登録
            </Button>
        ) : (
            <>
                <Button
                    onClick={() => setShowApprovalModal(true)}
                    className={buttonStyleClass}
                >
                    設計書・稟議登録
                </Button>
                <Modal
                    show={showApprovalModal}
                    onHide={() => setShowApprovalModal(false)}
                >
                    <Modal.Header>
                        <Modal.Title>
                            <span className='d-block'>
                                設計書・稟議書アップロード
                            </span>
                            <small className='text-secondary'>
                                {construction.name}
                            </small>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={onSubmitApproval}>
                            <FormGroup>
                                <FormLabel>
                                    <Badge variant='danger' className='mr-2'>
                                        必須
                                    </Badge>
                                    設計書
                                </FormLabel>
                                <input
                                    type='file'
                                    className='form-control-file'
                                    onChange={e => {
                                        if (!e.target.files) return;
                                        setUpdateApprovalState({
                                            ...updateApprovalState,
                                            specFile: e.target.files[0],
                                        });
                                    }}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>
                                    <Badge variant='danger' className='mr-2'>
                                        必須
                                    </Badge>
                                    稟議書
                                </FormLabel>
                                <input
                                    type='file'
                                    className='form-control-file'
                                    onChange={e => {
                                        if (!e.target.files) return;
                                        setUpdateApprovalState({
                                            ...updateApprovalState,
                                            approvalFile: e.target.files[0],
                                        });
                                    }}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>
                                    <Badge variant='secondary' className='mr-2'>
                                        任意
                                    </Badge>
                                    メモ
                                </FormLabel>
                                <textarea
                                    className='form-control'
                                    value={updateApprovalState.approvalMemo}
                                    onChange={e =>
                                        setUpdateApprovalState({
                                            ...updateApprovalState,
                                            approvalMemo: e.target.value,
                                        })
                                    }
                                    placeholder='メモを入力してください。'
                                />
                            </FormGroup>
                            <div className='text-right'>
                                {isLoadingApproval ? (
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
                                        variant='light'
                                        className='bg-white border'
                                    >
                                        アップロード
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
    if (contract.nextAction === 'inquiry') {
        return (
            <Link
                href={`/contracts/${construction.latestContract.id}/inquiry`}
                passHref
            >
                <Button as='a' className={buttonStyleClass}>
                    契約伺い
                </Button>
            </Link>
        );
    }
    if (contract.nextAction === 'agreement') {
        if (!contract.id) return null;
        return (
            <Link href={`/contracts/${contract.id}/agreement`} passHref>
                <Button as='a' className={buttonStyleClass}>
                    契約登録
                </Button>
            </Link>
        );
    }
    if (contract.nextAction === 'construction_in_progress')
        return contract.isProcessing ? (
            <Button
                onClick={() => alert('工事管理シート編集中です')}
                className={buttonStyleClass}
            >
                建仮
            </Button>
        ) : (
            <Link
                href={`/constructions/${construction.id}/construction_in_progress`}
                passHref
            >
                <Button as='a' className={buttonStyleClass}>
                    建仮
                </Button>
            </Link>
        );
    if (contract.nextAction === 'retirement_and_construction_in_progress')
        return contract.isProcessing ? (
            <>
                <Button
                    onClick={() => alert('工事管理シート編集中です')}
                    className={buttonStyleClass}
                >
                    建仮
                </Button>
                <Button
                    onClick={() => alert('工事管理シート編集中です')}
                    className={buttonStyleClass}
                >
                    除却
                </Button>
            </>
        ) : (
            <>
                <CIPActionButtonWithModal
                    contract={contract}
                    construction={construction}
                />
                <Link
                    href={`/constructions/${construction.id}/retirement/select_construction_statement`}
                    passHref
                >
                    <Button className={buttonStyleClass} as='a'>
                        除却
                    </Button>
                </Link>
            </>
        );
    if (contract.nextAction === 'retirement')
        return (
            <Link
                href={`/constructions/${construction.id}/retirement/select_construction_statement`}
                passHref
            >
                <Button className={buttonStyleClass} as='a'>
                    除却
                </Button>
            </Link>
        );

    return null;
};
