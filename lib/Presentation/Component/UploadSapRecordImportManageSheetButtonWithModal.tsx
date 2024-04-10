import { AssetStatement } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import React, { ChangeEvent, FC, FormEventHandler, useState } from 'react';
import { Badge, Button, Form, Modal, ModalProps } from 'react-bootstrap';
import {
    AssetStatementRepository,
    SapRecordParamsForAssetStatementUpdate,
} from '@/Domain/Repository';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { Excel } from '@/Infrastructure';
import {
    ConstructionInformationSheet,
    AssetAndUnitSheet,
} from '@/Domain/ValueObject';

export const UploadSapRecordImportManageSheetButtonWithModal: FC<
    ModalProps & { constructionId: number; assetStatements: AssetStatement[] }
> = ({ constructionId, assetStatements, ...modalProps }) => {
    const [sapRecordImportManageSheet, setSapRecordImportManageSheet] =
        useState<File>();
    const [isShow, setIsShow] = useState(false);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        if (!sapRecordImportManageSheet) return;

        try {
            await importSapRecords(sapRecordImportManageSheet, assetStatements);
            await ConstructionRepository.updateSapRecordImportManageSheet(
                constructionId,
                sapRecordImportManageSheet,
            );
            alert('SAPレコードの取り込みに成功しました');
            setIsShow(false);
        } catch (e) {
            alert('SAPレコードの取り込みに失敗しました');
            setIsShow(false);
            console.error(e);
        }
    };

    const importSapRecords = async (
        file: File,
        assetStatements: AssetStatement[],
    ) => {
        const book = await Excel.read(file);
        const constructionInformationSummaries =
            new ConstructionInformationSheet(book)
                .constructionInformationSummaries;
        const assetAndUnitSummaries = new AssetAndUnitSheet(book)
            .assetAndUnitSummaries;

        const sapRecordParamsForAssetStatementUpdate: SapRecordParamsForAssetStatementUpdate[] =
            assetStatements
                .filter(as => !as.assetClass?.name.match(/費用計上/))
                .flatMap(as => {
                    const constructionInformationSummary =
                        constructionInformationSummaries.find(summary => {
                            return (
                                summary.constructionTypeSerialNumber ===
                                as.constructionTypeSerialNumber
                            );
                        });
                    assertsIsExists(
                        constructionInformationSummary,
                        '対応する工事情報入力シートの行がありません',
                    );

                    const assetAndUnitSummary = assetAndUnitSummaries.find(
                        summary =>
                            summary.sapWbsCode ===
                                constructionInformationSummary.sapWbsCode &&
                            summary.businessCodeName ===
                                constructionInformationSummary.businessCodeName &&
                            summary.assetName ===
                                constructionInformationSummary.assetName &&
                            summary.assetText ===
                                constructionInformationSummary.assetText &&
                            summary.assetClassName ===
                                constructionInformationSummary.assetClassName,
                    );
                    if (!assetAndUnitSummary) return [];
                    assertsIsNotNull(as.id, '資産にIDがありません');

                    return {
                        assetStatementId: as.id,
                        sapWbsCode: assetAndUnitSummary.sapWbsCode,
                        sapBusinessCode:
                            constructionInformationSummary.sapBusinessCode,
                        sapRecordedAt: assetAndUnitSummary.sapRecordedAt,
                    };
                });
        await AssetStatementRepository.updateBySapRecords(
            sapRecordParamsForAssetStatementUpdate,
        );
    };
    return (
        <>
            <Button
                variant='light'
                className='bg-white border'
                onClick={() => setIsShow(true)}
            >
                工事管理シートをアップロード
            </Button>
            <Modal
                size={'lg'}
                show={isShow}
                onHide={() => setIsShow(false)}
                {...modalProps}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        SAPレコード取り込み用工事管理シートをアップロード
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onSubmit}>
                        <Form.Group>
                            <Form.Label>
                                <Badge variant='danger' className='mr-2'>
                                    必須
                                </Badge>
                                工事管理シート
                            </Form.Label>
                            <Form.File.Input
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    e.target.files &&
                                    setSapRecordImportManageSheet(
                                        e.target.files[0],
                                    )
                                }
                            />
                        </Form.Group>
                        <div className='text-right'>
                            <Button
                                type='submit'
                                variant='light'
                                className='bg-white border'
                            >
                                工事管理シートをアップロード
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};
