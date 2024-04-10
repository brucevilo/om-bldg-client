import { getClient } from '@/Infrastructure';
export enum Stage {
    Estimate = 'estimate',
    Agreement = 'agreement',
    DesignEstimate = 'design_estimate',
    DesignAgreement = 'design_agreement',
    Cips = 'cips',
}

export class ManageSheetService {
    static async upload(
        constructionId: number,
        manageSheet: File,
    ): Promise<void> {
        await getClient().formPatch(`/constructions/${constructionId}`, {
            'manage_sheet': manageSheet,
        });
    }

    public static async updateForEstimated(
        constructionId: number,
    ): Promise<void> {
        await getClient().patch(
            `/constructions/${constructionId}/manage_sheets?stage=estimate`,
            {},
        );
    }

    public static async updateForAgreement(
        constructionId: number,
        file: File,
        revise?: boolean,
    ): Promise<void> {
        await getClient().formPatch(
            `/constructions/${constructionId}/manage_sheets?stage=agreement`,
            {
                file,
                revise,
            },
        );
    }

    static async uploadForDesign(
        designId: number,
        manageSheet: File,
    ): Promise<void> {
        await getClient().formPatch(`/designs/${designId}`, {
            'manage_sheet': manageSheet,
        });
    }

    public static async updateForDesignAgreement(
        designId: number,
        file: File,
        revise?: boolean,
    ): Promise<void> {
        await getClient().formPatch(
            `/designs/${designId}/manage_sheets?stage=design_agreement`,
            {
                file,
                revise,
            },
        );
    }

    public static async updateForDesignEstimated(
        designId: number,
    ): Promise<void> {
        await getClient().patch(
            `/designs/${designId}/manage_sheets?stage=design_estimate`,
            {},
        );
    }
    public static async updateForCips(
        constructionId: number,
        assetStatementIds: number[],
    ): Promise<void> {
        await getClient().patch(
            `/constructions/${constructionId}/manage_sheets?stage=cips`,
            { asset_statement_ids: assetStatementIds },
        );
    }

    public static stageToText(stage: Stage): string {
        switch (stage) {
            case Stage.Estimate:
                return '積算';
            case Stage.Agreement:
                return '工事契約';
            case Stage.DesignEstimate:
                return '予定価格';
            case Stage.DesignAgreement:
                return '契約';
            case Stage.Cips:
                return '精算';
            default:
                return '';
        }
    }
}
