import React, { FormEventHandler, useState, FC, ChangeEvent } from 'react';
import { Design } from '@/Domain/Entity';
import Link from 'next/link';
import {
    Button,
    Modal,
    FormGroup,
    Badge,
    FormLabel,
    Form,
    Spinner,
} from 'react-bootstrap';
import { ContractRepository } from '@/Domain/Repository';
import { Estimate } from '@/App/Service';
import { useRouter } from 'next/router';
import { CoverItemWithWorkSheetError } from '@/App/Service/CoverItemWithWorkSheetError';
import { UploadCostDocumentModalWarnings } from '@/Presentation/Component/UploadCostDocumentModalWarnings';

interface Props {
    design: Design;
    disabled?: boolean;
}

export const DesignActionButton: FC<Props> = ({ design, disabled }) => {
    const [showUploadCostModal, setShowUploadCostModal] = useState(false);
    const [specFile, setSpecFile] = useState<File>();
    const [costDocument, setCostDocument] = useState<File>();
    const [manageSheet, setManageSheet] = useState<File>();
    const [approvalFilesUploading, setApprovalFilesUploading] = useState(false);
    const [costFilesUploading, setCostFilesUploading] = useState(false);

    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [updateApprovalState, setUpdateApprovalState] = useState<{
        id: number;
        approvalFile: File | null;
        approvalMemo: string;
    }>({
        id: design.latestContract.id as number,
        approvalFile: null,
        approvalMemo: '',
    });
    const router = useRouter();
    const contract = design.latestContract;

    const onUploadSpec: FormEventHandler = async e => {
        e.preventDefault();
        if (!costDocument || !manageSheet) return;
        setCostFilesUploading(true);
        try {
            await new Estimate(design, costDocument, manageSheet).invoke();
            router.push('/designs?next_action=approval');
        } catch (e) {
            console.error(e);
            if (e instanceof CoverItemWithWorkSheetError) {
                alert(e.message);
            } else {
                alert(
                    '登録に失敗しました。アップロードファイルに不備がある可能性があります',
                );
            }
        } finally {
            setShowUploadCostModal(false);
            setCostFilesUploading(false);
        }
    };

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        if (!updateApprovalState.approvalFile || !specFile) return;
        setApprovalFilesUploading(true);
        try {
            await ContractRepository.updateApproval({
                id: updateApprovalState.id,
                approvalFile: updateApprovalState.approvalFile,
                specFile: specFile,
                approvalMemo: updateApprovalState.approvalMemo,
            });
        } catch (e) {
            alert(
                '登録に失敗しました。アップロードファイルに不備がある可能性があります',
            );
        } finally {
            setShowApprovalModal(false);
            setApprovalFilesUploading(false);
        }
        router.push('/designs?next_action=inquiry');
    };

    // 移行ツール経由で作成された設計は工事登録ボタンからファイルアップロードできない
    if (design.madeByMigration) return <></>;

    switch (contract.nextAction) {
        case 'upload_cost_document':
            return (
                <>
                    <Button
                        disabled={disabled}
                        onClick={() => setShowUploadCostModal(true)}
                        variant='light'
                        className='bg-white border'
                    >
                        内訳書
                    </Button>
                    <Modal
                        show={showUploadCostModal}
                        onHide={() => setShowUploadCostModal(false)}
                    >
                        <Modal.Header>
                            <Modal.Title>
                                <span className='d-block'>内訳書</span>
                                <small className='text-secondary'>
                                    {design.name}
                                </small>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={onUploadSpec}>
                                <Form.Group>
                                    <Form.Label>
                                        <Badge
                                            variant='danger'
                                            className='mr-1'
                                        >
                                            必須
                                        </Badge>
                                        内訳書
                                    </Form.Label>
                                    <Form.File
                                        required
                                        disabled={costFilesUploading}
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) => {
                                            if (!e.target.files) return;
                                            setCostDocument(e.target.files[0]);
                                        }}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        <Badge
                                            variant='danger'
                                            className='mr-1'
                                        >
                                            必須
                                        </Badge>
                                        工事管理シート
                                    </Form.Label>
                                    <Form.File
                                        required
                                        onChange={(
                                            e: ChangeEvent<HTMLInputElement>,
                                        ) => {
                                            if (!e.target.files) return;
                                            setManageSheet(e.target.files[0]);
                                        }}
                                    />
                                </Form.Group>
                                <div className='d-flex justify-content-end'>
                                    {costFilesUploading ? (
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
                                        >
                                            登録
                                        </Button>
                                    )}
                                </div>
                            </Form>
                            <UploadCostDocumentModalWarnings />
                        </Modal.Body>
                    </Modal>
                </>
            );
        case 'approval':
            return contract.isProcessing ? (
                <Button
                    variant='light'
                    onClick={() => alert('工事管理シート編集中です')}
                    className='bg-white border'
                >
                    仕様書・稟議登録
                </Button>
            ) : (
                <>
                    <Button
                        variant='light'
                        className='bg-white border'
                        onClick={() => setShowApprovalModal(true)}
                    >
                        仕様書・稟議登録
                    </Button>
                    <Modal
                        show={showApprovalModal}
                        onHide={() => setShowApprovalModal(false)}
                    >
                        <Modal.Header>
                            <Modal.Title>
                                <span className='d-block'>
                                    仕様書・稟議書アップロード
                                </span>
                                <small className='text-secondary'>
                                    {design.name}
                                </small>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={onSubmit}>
                                <FormGroup>
                                    <Form.Group>
                                        <Form.Label>
                                            <Badge
                                                variant='danger'
                                                className='mr-1'
                                            >
                                                必須
                                            </Badge>
                                            仕様書
                                        </Form.Label>
                                        <Form.File
                                            required
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) => {
                                                if (!e.target.files) return;
                                                setSpecFile(e.target.files[0]);
                                            }}
                                        />
                                    </Form.Group>
                                    <FormLabel>
                                        <Badge
                                            variant='danger'
                                            className='mr-2'
                                        >
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
                                        <Badge
                                            variant='secondary'
                                            className='mr-2'
                                        >
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
                                    />
                                </FormGroup>
                                <div className='text-right'>
                                    {approvalFilesUploading ? (
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
        case 'inquiry':
            return (
                <Link
                    href={`/contracts/${design.latestContract.id}/inquiry`}
                    passHref
                >
                    <Button variant='light' className='bg-white border' as='a'>
                        契約伺い
                    </Button>
                </Link>
            );
        case 'agreement':
            return (
                <Link href={`/contracts/${contract.id}/agreement`} passHref>
                    <Button variant='light' className='bg-white border' as='a'>
                        契約登録
                    </Button>
                </Link>
            );
        case 'construction':
            return contract.isProcessing ? (
                <Button
                    onClick={() => alert('工事管理シート編集中です')}
                    variant='light'
                    className='bg-white border'
                >
                    工事登録
                </Button>
            ) : (
                <Link href={`/designs/${design.id}/constructions`} passHref>
                    <Button variant='light' className='bg-white border' as='a'>
                        工事登録
                    </Button>
                </Link>
            );
    }
    throw new Error('対応するActionが存在しません');
};
