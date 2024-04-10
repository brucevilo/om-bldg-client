import { User } from './User';
import { Stage } from '@/App/Service';

export interface UpdateManageSheetErrorData {
    constructionId: number;
    constructionName: string;
    stage: Stage;
    errorCase: string;
}

export interface UpdateManageSheetData {
    constructionId: number;
    constructionName: string;
    stage: Stage;
}

export interface UpdateDesignManageSheetData {
    designId: number;
    designName: string;
    stage: Stage;
}

export interface UpdateDesignManageSheetErrorData {
    designId: number;
    designName: string;
    stage: Stage;
    errorCase: string;
}

export interface UpdateCsvIkkatuUploadData {
    retirementId: number;
}

export interface UpdateCsvIkkatuUploadErrorData {
    constructionId: number;
    constructionStatementId: number;
    errorCase: string;
}

export type UpdateActionHistoryData = null;

export type UpdateCsScheduleData = { contractId: number };

export enum Kind {
    UpdateManageSheet = 'update_manage_sheet',
    UpdateManageSheetError = 'update_manage_sheet_error',
    UpdateCsvIkkatuUpload = 'update_csv_ikkatu_upload',
    UpdateCsvIkkatuUploadError = 'update_csv_ikkatu_upload_error',
    UpdateDesignManageSheet = 'update_design_manage_sheet',
    UpdateDesignManageSheetError = 'update_design_manage_sheet_error',
    UpdateActionHistory = 'update_action_history',
    UpdateCsSchedule = 'update_cs_schedule',
}

export class Notification {
    constructor(
        public id: number,
        public text: string,
        public link: string,
        public kind: Kind,
        public data:
            | UpdateManageSheetData
            | UpdateManageSheetErrorData
            | UpdateCsvIkkatuUploadData
            | UpdateCsvIkkatuUploadErrorData
            | UpdateDesignManageSheetData
            | UpdateDesignManageSheetErrorData
            | UpdateActionHistoryData
            | UpdateCsScheduleData
            | null,
        public user: User,
        public createdAt: Date,
        public updatedAt: Date,
    ) {}
}
