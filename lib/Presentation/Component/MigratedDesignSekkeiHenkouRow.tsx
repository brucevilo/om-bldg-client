import { AttachmentService } from '@/App/Service/AttachmentService';
import { EditMigratedDesignContractForm } from '@/App/Service/EditMigratedDesignContract';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import { MigratedFileUploadIcon } from './MigratedFileUploadIcon';

interface Props {
    contractForm: EditMigratedDesignContractForm;
    onChangeNewForm: (newForm: EditMigratedDesignContractForm) => void;
    onDeleteColumn: () => void;
    index: number;
    isLastRow: boolean;
}

interface DeleteButtonProps {
    onDeleteColumn: () => void;
}

const DeleteColumnButton: FC<DeleteButtonProps> = props => {
    return (
        <Button
            variant='outline-secondary'
            className='px-2 py-0'
            type='button'
            onClick={() => props.onDeleteColumn()}
        >
            <FontAwesomeIcon icon={faMinus} />
        </Button>
    );
};

export const MigratedDesignSekkeiHenkouRow: FC<Props> = props => {
    return (
        <tr className='text-center'>
            <td
                style={{
                    border: 'none',
                }}
            >
                {props.isLastRow ? (
                    <DeleteColumnButton
                        onDeleteColumn={() => props.onDeleteColumn()}
                    />
                ) : (
                    <>　</>
                )}
            </td>
            <td>設計{props.index}</td>
            <td>
                <MigratedFileUploadIcon
                    id={`spec_file_${props.contractForm?.id}-${props.index}`}
                    isUploaded={
                        !!props.contractForm?.specFileBase64 ||
                        !!props.contractForm?.specFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedDesignContractForm = {
                            ...props.contractForm,
                            specFileBase64:
                                await AttachmentService.convertBlobToBase64(
                                    file,
                                ),
                            specFileName: file.name,
                        };
                        props.onChangeNewForm(newForm);
                    }}
                />
            </td>
            <td>
                <MigratedFileUploadIcon
                    id={`cost_document_${props.contractForm?.id}-${props.index}`}
                    isUploaded={
                        !!props.contractForm?.costDocumentBase64 ||
                        !!props.contractForm?.costDocumentInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedDesignContractForm = {
                            ...props.contractForm,
                            costDocumentBase64:
                                await AttachmentService.convertBlobToBase64(
                                    file,
                                ),
                            costDocumentName: file.name,
                        };
                        props.onChangeNewForm(newForm);
                    }}
                />
            </td>
            <td>
                <MigratedFileUploadIcon
                    id={`contract_file_${props.contractForm?.id}-${props.index}`}
                    isUploaded={
                        !!props.contractForm?.contractFileBase64 ||
                        !!props.contractForm?.contractFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedDesignContractForm = {
                            ...props.contractForm,
                            contractFileBase64:
                                await AttachmentService.convertBlobToBase64(
                                    file,
                                ),
                            contractFileName: file.name,
                        };
                        props.onChangeNewForm(newForm);
                    }}
                />
            </td>
            <td>
                <MigratedFileUploadIcon
                    id={`assessment_file_${props.contractForm?.id}-${props.index}`}
                    isUploaded={
                        !!props.contractForm?.assessmentFileBase64 ||
                        !!props.contractForm?.assessmentFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedDesignContractForm = {
                            ...props.contractForm,
                            assessmentFileBase64:
                                await AttachmentService.convertBlobToBase64(
                                    file,
                                ),
                            assessmentFileName: file.name,
                        };
                        props.onChangeNewForm(newForm);
                    }}
                />
            </td>
            <td>
                <MigratedFileUploadIcon
                    id={`approval_file_${props.contractForm?.id}-${props.index}`}
                    isUploaded={
                        !!props.contractForm?.approvalFileBase64 ||
                        !!props.contractForm?.approvalFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedDesignContractForm = {
                            ...props.contractForm,
                            approvalFileBase64:
                                await AttachmentService.convertBlobToBase64(
                                    file,
                                ),
                            approvalFileName: file.name,
                        };
                        props.onChangeNewForm(newForm);
                    }}
                />
            </td>
        </tr>
    );
};
