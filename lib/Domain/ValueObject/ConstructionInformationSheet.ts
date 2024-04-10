import XLSX, { WorkBook, Sheet } from 'xlsx';

enum ConstructionInformationSummaryRow {
    工事種別連番 = 5,
    資産名称 = 7,
    資産テキスト = 8,
    資産クラス名 = 29,
    WBS_LV3 = 37,
    事業コード = 42,
    事業コード名 = 43,
}

type ConstructionInformationSummaryRowKey = {
    [ConstructionInformationSummaryRow.工事種別連番]: number;
    [ConstructionInformationSummaryRow.資産名称]: string;
    [ConstructionInformationSummaryRow.資産テキスト]: string;
    [ConstructionInformationSummaryRow.資産クラス名]: string;
    [ConstructionInformationSummaryRow.WBS_LV3]: string;
    [ConstructionInformationSummaryRow.事業コード]: string;
    [ConstructionInformationSummaryRow.事業コード名]: string;
};

export type ConstructionInformationSummary = {
    constructionTypeSerialNumber: number;
    assetName: string;
    assetText: string;
    assetClassName: string;
    sapWbsCode: string;
    sapBusinessCode: string;
    businessCodeName: string;
};

export class ConstructionInformationSheet {
    private _constructionInfoSummaries: ConstructionInformationSummary[];
    constructor(public book: WorkBook) {
        this._constructionInfoSummaries =
            this.buildConstructionInformationSummaries();
    }
    private buildConstructionInformationSummaries(): ConstructionInformationSummary[] {
        const summaryRows =
            XLSX.utils.sheet_to_json<ConstructionInformationSummaryRowKey>(
                this.constructionInformationSheet,
                { blankrows: true },
            );

        const contentStartIdx = 13;
        const contentEndIdx =
            summaryRows.findIndex(
                r =>
                    r[ConstructionInformationSummaryRow.WBS_LV3] ===
                    '明細終了位置',
            ) - 1;
        return summaryRows.slice(contentStartIdx, contentEndIdx).map(r => {
            return {
                constructionTypeSerialNumber:
                    r[ConstructionInformationSummaryRow.工事種別連番],
                assetName: r[ConstructionInformationSummaryRow.資産名称],
                assetText: r[ConstructionInformationSummaryRow.資産テキスト],
                assetClassName:
                    r[ConstructionInformationSummaryRow.資産クラス名],
                sapWbsCode: r[ConstructionInformationSummaryRow.WBS_LV3],
                sapBusinessCode:
                    r[ConstructionInformationSummaryRow.事業コード],
                businessCodeName:
                    r[ConstructionInformationSummaryRow.事業コード名],
            };
        });
    }

    public get constructionInformationSummaries(): ConstructionInformationSummary[] {
        return this._constructionInfoSummaries;
    }

    private get constructionInformationSheet(): Sheet {
        return this.book.Sheets['工事情報入力シート'];
    }
}
