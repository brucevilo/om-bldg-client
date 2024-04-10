import React, { FC, useState } from 'react';
import { useEffect } from 'react';
import { Modal, ModalProps, Spinner, Table } from 'react-bootstrap';
import { assertsIsExists, Excel } from '@/Infrastructure';
import { CostDocument } from '@/Domain/ValueObject';
import {
    checkCoverItemWithWorkSheetName,
    checkDepartmentNameExistence,
    checkDetailExceptPriceSlipNotation,
    checkDetailExistence,
    checkEofFrontRearAmountNone,
    checkEolNone,
    checkMemoExistence,
    checkNameArrayDColumn,
} from '@/App/Service/Validaty/CostDocumentToEstimationSheet';
import { CostDocumentFormatChecker } from '@/Domain/Service/CostDocumentFormatChecker';

export const CostDocumentErrorCheckListModal: FC<
    ModalProps & { costDocument: File }
> = props => {
    const { costDocument, ...modalProps } = props;
    const [
        errorListDetailNameWithWorkSheetNameNoMatched,
        setErrorListDetailNameWithWorkSheetNameNoMatched,
    ] = useState<boolean | undefined>();
    const [errorListEolNone, setErrorListEolNone] = useState<
        boolean | undefined
    >();
    const [
        errorListCoverItemWithWorkSheetName,
        setErrorListCoverItemWithWorkSheetName,
    ] = useState<boolean | undefined>();
    const [
        errorListEofFrontRearAmountNone,
        setErrorListEofFrontRearAmountNone,
    ] = useState<boolean | undefined>();
    const [errorListMemoExistence, setErrorListMemoExistence] = useState<
        boolean | undefined
    >();
    const [errorListDetailExistence, setErrorListDetailExistence] = useState<
        boolean | undefined
    >();
    const [errorListPresenceCoverSheet, setErrorListPresenceCoverSheet] =
        useState<boolean | undefined>();
    const [
        errorListDetailExceptPriceSlipNotation,
        setErrorListDetailExceptPriceSlipNotation,
    ] = useState<boolean | undefined>();
    const [errorListNameArrayDColumn, setErrorListNameArrayDColumn] = useState<
        boolean | undefined
    >();
    const [errorDepartmentNameExistence, setErrorDepartmentNameExistence] =
        useState<boolean | undefined>();

    const costDocumentToErrorCheck = async () => {
        const costDocumentWorkBook = await Excel.read(costDocument);
        const newCostDocument = new CostDocument(costDocumentWorkBook);
        assertsIsExists(newCostDocument, 'CostDocumentが存在しません');
        const coverSheet = newCostDocument.coverSheet;
        try {
            const coverKeys = Object.keys(coverSheet);
            const rowIndex = 28;
            const formatChecker = new CostDocumentFormatChecker(
                newCostDocument,
            );
            const formatCheckResult = formatChecker.allKoujimeiSameCheck();
            if (formatCheckResult.result) {
                setErrorListDetailNameWithWorkSheetNameNoMatched(true);
            } else {
                setErrorListDetailNameWithWorkSheetNameNoMatched(false);
            }
            try {
                checkEolNone(coverKeys, coverSheet, newCostDocument.eofCol);
                setErrorListEolNone(true);
            } catch {
                setErrorListEolNone(false);
            }
            try {
                checkCoverItemWithWorkSheetName(coverSheet, newCostDocument);
                setErrorListCoverItemWithWorkSheetName(true);
            } catch {
                setErrorListCoverItemWithWorkSheetName(false);
            }
            try {
                checkEofFrontRearAmountNone(coverSheet, newCostDocument);
                setErrorListEofFrontRearAmountNone(true);
            } catch {
                setErrorListEofFrontRearAmountNone(false);
            }
            try {
                checkMemoExistence(coverSheet, newCostDocument);
                setErrorListMemoExistence(true);
            } catch {
                setErrorListMemoExistence(false);
            }
            try {
                checkDetailExistence(coverSheet, newCostDocument);
                setErrorListDetailExistence(true);
            } catch {
                setErrorListDetailExistence(false);
            }
            const presenceCoverSheet = coverSheet == null ? false : true;
            setErrorListPresenceCoverSheet(presenceCoverSheet);
            try {
                checkDetailExceptPriceSlipNotation(coverSheet, rowIndex);
                setErrorListDetailExceptPriceSlipNotation(true);
            } catch {
                setErrorListDetailExceptPriceSlipNotation(false);
            }
            try {
                checkNameArrayDColumn(coverSheet, rowIndex);
                setErrorListNameArrayDColumn(true);
            } catch {
                setErrorListNameArrayDColumn(false);
            }
            try {
                checkDepartmentNameExistence(coverSheet, newCostDocument);
                setErrorDepartmentNameExistence(true);
            } catch {
                setErrorDepartmentNameExistence(false);
            }
        } catch {
            setErrorListDetailNameWithWorkSheetNameNoMatched(false);
            setErrorListEolNone(false);
            setErrorListCoverItemWithWorkSheetName(false);
            setErrorListEofFrontRearAmountNone(false);
            setErrorListMemoExistence(false);
            setErrorListDetailExistence(false);
            setErrorListPresenceCoverSheet(false);
            setErrorListDetailExceptPriceSlipNotation(false);
            setErrorListNameArrayDColumn(false);
            setErrorDepartmentNameExistence(false);
        }
    };
    useEffect(() => {
        costDocumentToErrorCheck();
    }, []);

    const errorCheckListDecision = (
        decision: boolean | undefined,
    ): JSX.Element => {
        if (decision === undefined) {
            return (
                <th>
                    <Spinner animation='border' role='status' size='sm' />
                </th>
            );
        }
        return <th>{decision ? '○' : '×'}</th>;
    };

    return (
        <Modal {...modalProps} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>エラーチェックリスト</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table>
                    <thead>
                        <tr>
                            <th>エラー項目</th>
                            <th>結果</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>名称一致</th>
                            {errorCheckListDecision(
                                errorListDetailNameWithWorkSheetNameNoMatched,
                            )}
                        </tr>
                        <tr>
                            <th>
                                内訳書の表紙のMまたはP列(変更明細はP)にEOLがない
                            </th>
                            {errorCheckListDecision(errorListEolNone)}
                        </tr>
                        <tr>
                            <th>
                                表紙のL列(変更後明細はO)の「工事○」の数と工事シートの数が一致しない、名称の一致も確認
                            </th>
                            {errorCheckListDecision(
                                errorListCoverItemWithWorkSheetName,
                            )}
                        </tr>
                        <tr>
                            <th>eof行の前後に合計金額がある</th>
                            {errorCheckListDecision(
                                errorListEofFrontRearAmountNone,
                            )}
                        </tr>
                        <tr>
                            <th>J27もしくはM27に摘要がある</th>
                            {errorCheckListDecision(errorListMemoExistence)}
                        </tr>
                        <tr>
                            <th>明細のpart部が存在しない</th>
                            {errorCheckListDecision(errorListDetailExistence)}
                        </tr>
                        <tr>
                            <th>表紙のシートが存在しない</th>
                            {errorCheckListDecision(
                                errorListPresenceCoverSheet,
                            )}
                        </tr>
                        <tr>
                            <th>明細行以外の金額行の表示が正しい</th>
                            {errorCheckListDecision(
                                errorListDetailExceptPriceSlipNotation,
                            )}
                        </tr>
                        <tr>
                            <th>名前列がD列にある</th>
                            {errorCheckListDecision(errorListNameArrayDColumn)}
                        </tr>
                        <tr>
                            <th>
                                内訳書の表紙のLまたはO列(変更明細はO)に費目がない
                            </th>
                            {errorCheckListDecision(
                                errorDepartmentNameExistence,
                            )}
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>
    );
};
