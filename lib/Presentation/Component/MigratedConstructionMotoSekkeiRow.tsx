import { AttachmentService } from '@/App/Service';
import { EditMigratedConstructionContractFileForm } from '@/App/Service/EditMigratedConstructionContractFile';
import { GenerateUpdateContractParamsFromAssessmentFileService } from '@/Domain/Service/GenerateUpdateContractParamsFromAssessmentFileService';
import { Excel } from '@/Infrastructure';
import React, { FC } from 'react';
import { MigratedFileUploadIcon } from './MigratedFileUploadIcon';

interface Props {
    motoSekkeiContractForm: EditMigratedConstructionContractFileForm;
    onChangeNewForm: (
        newForm: EditMigratedConstructionContractFileForm,
    ) => void;
}

export const MigratedConstructionMotoSekkeiRow: FC<Props> = props => {
    return (
        <tr className='text-center'>
            <td
                style={{
                    border: 'none',
                    height: '3.5rem',
                }}
            ></td>
            <td>元設計</td>
            <td>
                <MigratedFileUploadIcon
                    id={`spec_file_${props.motoSekkeiContractForm?.id}`}
                    isUploaded={
                        !!props.motoSekkeiContractForm?.specFileBase64 ||
                        !!props.motoSekkeiContractForm?.specFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedConstructionContractFileForm =
                            {
                                ...props.motoSekkeiContractForm,
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
                    id={`cost_document_${props.motoSekkeiContractForm?.id}`}
                    isUploaded={
                        !!props.motoSekkeiContractForm?.costDocumentBase64 ||
                        !!props.motoSekkeiContractForm?.costDocumentInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedConstructionContractFileForm =
                            {
                                ...props.motoSekkeiContractForm,
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
                    id={`contract_file_${props.motoSekkeiContractForm?.id}`}
                    isUploaded={
                        !!props.motoSekkeiContractForm?.contractFileBase64 ||
                        !!props.motoSekkeiContractForm?.contractFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedConstructionContractFileForm =
                            {
                                ...props.motoSekkeiContractForm,
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
                    id={`assessment_file_${props.motoSekkeiContractForm?.id}`}
                    isUploaded={
                        !!props.motoSekkeiContractForm?.assessmentFileBase64 ||
                        !!props.motoSekkeiContractForm?.assessmentFileInfo
                    }
                    onFileUpload={async file => {
                        try {
                            const xlsxWorkBook = await Excel.read(file);
                            const params =
                                GenerateUpdateContractParamsFromAssessmentFileService.generateFromAssessmentFile(
                                    xlsxWorkBook,
                                );
                            // エクセルファイルに問題がある場合はアラートを出してファイルもContractも更新しない
                            if (params) {
                                const newForm: EditMigratedConstructionContractFileForm =
                                    {
                                        ...props.motoSekkeiContractForm,
                                        assessmentFileBase64:
                                            await AttachmentService.convertBlobToBase64(
                                                file,
                                            ),
                                        assessmentFileName: file.name,
                                        updateMigratedContractParams: params,
                                    };
                                props.onChangeNewForm(newForm);
                            }
                        } catch (error) {
                            console.error(error);
                            return alert(
                                'フォーマットエラーがあります。ファイルおよび項目の記載を確認ください',
                            );
                        }
                    }}
                />
            </td>
            <td>
                <MigratedFileUploadIcon
                    id={`approval_file_${props.motoSekkeiContractForm?.id}`}
                    isUploaded={
                        !!props.motoSekkeiContractForm?.approvalFileBase64 ||
                        !!props.motoSekkeiContractForm?.approvalFileInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedConstructionContractFileForm =
                            {
                                ...props.motoSekkeiContractForm,
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
            <td>
                <MigratedFileUploadIcon
                    id={`migrated_handover_document_${props.motoSekkeiContractForm?.id}`}
                    isUploaded={
                        !!props.motoSekkeiContractForm
                            ?.migratedHandoverDocumentBase64 ||
                        !!props.motoSekkeiContractForm
                            ?.migratedHandoverDocumentInfo
                    }
                    onFileUpload={async file => {
                        const newForm: EditMigratedConstructionContractFileForm =
                            {
                                ...props.motoSekkeiContractForm,
                                migratedHandoverDocumentBase64:
                                    await AttachmentService.convertBlobToBase64(
                                        file,
                                    ),
                                migratedHandoverDocumentName: file.name,
                            };
                        props.onChangeNewForm(newForm);
                    }}
                />
            </td>
        </tr>
    );
};
