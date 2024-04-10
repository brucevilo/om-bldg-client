import { Contract } from '@/Domain/Entity';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { Card } from 'react-bootstrap';

interface Props {
    currentContract: Contract;
    displayManageSheetInfo?: boolean;
}

export const MigratedConstructionDocument: FC<Props> = props => {
    return (
        <Card>
            <Card.Body>
                <div className='mb-4'>
                    <h6 className='font-weight-bold mb-2'>設計書</h6>
                    {props.currentContract?.specFileInfo ? (
                        <div className='d-flex justify-content-between align-items-center'>
                            <a
                                download
                                href={
                                    process.env.NEXT_PUBLIC_API_ORIGIN +
                                    props.currentContract?.specFileInfo.path
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faFileAlt}
                                    className='mr-2'
                                />
                                {props.currentContract?.specFileInfo.filename}
                            </a>
                        </div>
                    ) : (
                        <p>未登録</p>
                    )}
                </div>
                <div className='mb-4'>
                    <h6 className='font-weight-bold mb-2'>完成明細書</h6>
                    {props.currentContract?.costDocumentInfo ? (
                        <div className='d-flex justify-content-between align-items-center'>
                            <a
                                download
                                href={
                                    process.env.NEXT_PUBLIC_API_ORIGIN +
                                    props.currentContract?.costDocumentInfo.path
                                }
                            >
                                <FontAwesomeIcon
                                    icon={faFileAlt}
                                    className='mr-2'
                                />
                                {
                                    props.currentContract?.costDocumentInfo
                                        .filename
                                }
                            </a>
                        </div>
                    ) : (
                        <p>未登録</p>
                    )}
                </div>
                <h6 className='font-weight-bold mb-2'>工事管理シート</h6>
                <p>
                    移行ツール経由で作成されたため、概要タブにのみ最終版の工事管理シートが表示されます
                </p>
            </Card.Body>
        </Card>
    );
};
