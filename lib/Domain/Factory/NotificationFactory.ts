import {
    UpdateCsvIkkatuUploadData,
    UpdateCsvIkkatuUploadErrorData,
    UpdateManageSheetData,
    UpdateManageSheetErrorData,
    UpdateDesignManageSheetData,
    UpdateDesignManageSheetErrorData,
    Kind,
    Notification,
    UpdateActionHistoryData,
    UpdateCsScheduleData,
} from '@/Domain/Entity';
import { UserResponseObject, UserFactory } from '@/Domain/Factory';
import { Stage } from '@/App/Service';

export interface NotificationResponseData {
    contract_id: number;
    construction_id?: number;
    construction_statement_id: number;
    construction_name?: string;
    design_id?: number;
    design_name?: string;
    stage?: string;
    error_case?: string;
    retirement_id?: number;
}

export interface NotificationResponse {
    id: number;
    text: string;
    link: string;
    user: UserResponseObject;
    kind: Kind;
    data: NotificationResponseData | null;
    created_at: string;
    updated_at: string;
}

export function createDataFromResponseDataWithKind(
    data: NotificationResponseData,
    kind: Kind,
):
    | UpdateCsvIkkatuUploadData
    | UpdateCsvIkkatuUploadErrorData
    | UpdateManageSheetData
    | UpdateManageSheetErrorData
    | UpdateDesignManageSheetData
    | UpdateDesignManageSheetErrorData
    | UpdateActionHistoryData
    | UpdateCsScheduleData {
    if (kind == Kind.UpdateManageSheetError) {
        return {
            constructionId: data.construction_id,
            constructionName: data.construction_name,
            stage: data.stage as Stage,
            errorCase: data.error_case,
        } as UpdateManageSheetErrorData;
    } else if (kind === Kind.UpdateManageSheet) {
        return {
            constructionId: data.construction_id,
            constructionName: data.construction_name,
            stage: data.stage,
        } as UpdateManageSheetData;
    } else if (kind === Kind.UpdateCsvIkkatuUpload) {
        return {
            retirementId: data.retirement_id,
        } as UpdateCsvIkkatuUploadData;
    } else if (kind === Kind.UpdateCsvIkkatuUploadError) {
        return {
            constructionId: data.construction_id,
            constructionStatementId: data.construction_statement_id,
            errorCase: data.error_case,
        } as UpdateCsvIkkatuUploadErrorData;
    } else if (kind == Kind.UpdateDesignManageSheetError) {
        return {
            designId: data.design_id,
            designName: data.design_name,
            stage: data.stage as Stage,
            errorCase: data.error_case,
        } as UpdateDesignManageSheetErrorData;
    } else if (kind === Kind.UpdateDesignManageSheet) {
        return {
            designId: data.design_id,
            designName: data.design_name,
            stage: data.stage,
        } as UpdateDesignManageSheetErrorData;
    } else if (kind === Kind.UpdateActionHistory) {
        return null;
    } else if (kind === Kind.UpdateCsSchedule) {
        return {
            contractId: data.contract_id,
        };
    } else {
        throw new Error('Notificationのkindが不明な数値です');
    }
}

export class NotificationFactory {
    static createFromResponse(res: NotificationResponse): Notification {
        return new Notification(
            res.id,
            res.text,
            res.link,
            res.kind,
            res.data && createDataFromResponseDataWithKind(res.data, res.kind),
            UserFactory.createFromResponseObject(res.user),
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
