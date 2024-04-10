import { bytesToMb, extractFileExtention } from '@/App/Migrations/apps/utils';
import { fetchDocument } from '@/App/Service/fetchFiles';
import {
    AssetClass,
    AssetStatement,
    Construction,
    ConstructionStatement,
    Contract,
} from '@/Domain/Entity';
import {
    ContractRepository,
    ConstructionStatementRepository,
    AssetClassRepository,
    AssetStatementRepository,
} from '@/Domain/Repository';
import { MergeCostItems } from '@/Domain/Service';
import { cloneDeep } from 'lodash';
import React, { FC, FormEventHandler, useState, useEffect } from 'react';
import {
    Badge,
    Modal,
    ModalProps,
    Button,
    FormGroup,
    FormLabel,
    Spinner,
} from 'react-bootstrap';

export const ChangeConstructionPeriodModal: FC<
    ModalProps & {
        construction: Construction;
        statements: ConstructionStatement[];
        onComplete: () => void;
    }
> = props => {
    const { construction, statements, onComplete, ...modalProps } = props;
    const contractBeforeChange = construction.latestContract;
    const maxFileSize = 10;
    const allowableFileFormat = 'pdf';

    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [costDocument, setCostDocument] = useState<File>();
    const [manageSheet, setManageSheet] = useState<File>();
    const [specFile, setSpecFile] = useState<File>();
    const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
    const [updateApprovalState, setUpdateApprovalState] = useState<{
        id: number;
        approvalFile: File | null;
        approvalMemo: string;
    }>({
        id: construction.latestContract.id as number,
        approvalFile: null,
        approvalMemo: '',
    });

    const fetchManageSheet = async () => {
        if (!contractBeforeChange.manageSheetInfo) return;

        const manageSheetFile = await fetchDocument(
            contractBeforeChange.manageSheetInfo.path,
            contractBeforeChange.manageSheetInfo.filename,
        );

        setManageSheet(manageSheetFile);
    };

    const fetchCostDocument = async () => {
        if (!contractBeforeChange.costDocumentInfo) return;

        const costDocumentFile = await fetchDocument(
            contractBeforeChange.costDocumentInfo.path,
            contractBeforeChange.costDocumentInfo.filename,
        );

        setCostDocument(costDocumentFile);
    };

    const fetchSpecFile = async () => {
        if (!contractBeforeChange.specFileInfo) return;

        const specFile = await fetchDocument(
            contractBeforeChange.specFileInfo.path,
            contractBeforeChange.specFileInfo.filename,
        );

        setSpecFile(specFile);
    };

    useEffect(() => {
        AssetClassRepository.list().then(setAssetClasses);
        fetchCostDocument();
        fetchManageSheet();
        fetchSpecFile();
    }, []);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        if (!updateApprovalState.approvalFile) return;

        setIsUploading(true);

        // validate file
        const filesize = bytesToMb(updateApprovalState.approvalFile.size);
        const extension = extractFileExtention(
            updateApprovalState.approvalFile.name,
        );
        if (filesize > maxFileSize) {
            setIsUploading(false);
            alert(
                `${maxFileSize}}MB以下のファイルをアップロードしてください。`,
            );
        } else if (extension !== allowableFileFormat) {
            setIsUploading(false);
            alert(
                `$このファイル形式は対応していません。別のファイル形式を指定してください。`,
            );
        } else {
            const newContract = new Contract({
                constructionId: construction.id,
                approvalFile: updateApprovalState.approvalFile,
                approvalMemo: updateApprovalState.approvalMemo,
                costDocument: costDocument,
                manageSheet: manageSheet,
                specFile: specFile,
                contractedPrice: contractBeforeChange.contractedPrice,
                expectedPriceWithTax: contractBeforeChange.contractedPrice,
                contractNumber: contractBeforeChange.contractNumber,
                startAt: contractBeforeChange.startAt,
                supplierId: contractBeforeChange.supplierId,
                bidMethod: contractBeforeChange.bidMethod,
                designChiefId: contractBeforeChange.designChiefId,
                designStaffId: contractBeforeChange.designStaffId,
                constructionChiefId: contractBeforeChange.constructionChiefId,
                constructionStaffId: contractBeforeChange.constructionStaffId,
                expectedPrice: contractBeforeChange.contractedPriceWithoutTax,
                endAt: contractBeforeChange.endAt,
                nextAction: 'inquiry',
                isConstructionPeriodChanged: true,
            });

            //create new contract
            const contract = await ContractRepository.create(newContract);

            // get previous asset statements
            const prevAssetStatements =
                await AssetStatementRepository.listByConstruction(
                    construction.id as number,
                    construction.latestContract.id,
                );

            // use new contract to link construction statements
            const newStatements: ConstructionStatement[] = [];
            statements.forEach(item => {
                // calculate new merged cost items
                const mergedCostItems = new MergeCostItems(
                    cloneDeep(item),
                    [],
                    construction,
                    prevAssetStatements || [],
                    construction.contracts.length + 1 === 2,
                ).invoke();
                const cs = new ConstructionStatement(
                    null,
                    contract.id,
                    item.name,
                    item.projectCode,
                    item.term,
                    mergedCostItems,
                    item.classification,
                    false,
                    false,
                    null,
                    new Date(),
                    item.isCollateral,
                    item.id,
                    item,
                    null,
                    item.constructionStatementHistories,
                    new Date(),
                    new Date(),
                );

                newStatements.push(cs);
            });

            // save construction statements
            const storedConstructionStatements =
                await ConstructionStatementRepository.store(
                    newStatements,
                    construction.id as number,
                    assetClasses,
                );

            // use new construction statements to create copy of asset statements from previous ones
            const newAssetStatements: AssetStatement[] = [];
            prevAssetStatements.forEach((item, index) => {
                const prevConstructionStatementIndex = statements.findIndex(
                    statement => statement.id === item.constructionStatementId,
                );
                const as = new AssetStatement(
                    null,
                    storedConstructionStatements[prevConstructionStatementIndex]
                        .id as number,
                    prevAssetStatements[index].assetClass as AssetClass,
                    prevAssetStatements[index].name,
                    prevAssetStatements[index].assessmentPrice as number,
                    '',
                    null,
                    null,
                    prevAssetStatements[index].isPrivatized,
                    prevAssetStatements[index].sapFixedAssetId,
                    prevAssetStatements[index].constructionTypeSerialNumber,
                    0,
                    null,
                    new Date(),
                    new Date(),
                    prevAssetStatements[index].buildingsId,
                );

                newAssetStatements.push(as);
            });

            // store assetStatementRepository
            await AssetStatementRepository.store(
                construction.id as number,
                newAssetStatements,
            );
            setIsUploading(false);
            onComplete();
        }
    };
    return (
        <Modal {...modalProps}>
            <Modal.Header
                style={{ backgroundColor: '#666666', color: 'white' }}
                className='d-flex align-items-center'
                closeButton
            >
                <Modal.Title>
                    <span className='d-block'>稟議書アップロード</span>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={onSubmit}>
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
                        <small className='text-secondary'>
                            ファイルは10MBまで、PDF形式のみ対応しています。
                        </small>
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
                        />
                    </FormGroup>
                    <div className='text-right'>
                        {isUploading ? (
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
    );
};
