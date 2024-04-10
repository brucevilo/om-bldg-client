import XLSX, { WorkBook, Sheet } from 'xlsx';
import { excelConvertedDateToJst } from '@/Infrastructure/Excel';

enum AssetAndUnitSummaryRow {
    WBS = 2,
    資産名称 = 3,
    資産テキスト = 4,
    資産クラス名称 = 5,
    事業コード名 = 8,
    取得日付 = 20,
}

type AssetAndUnitSummaryRowKey = {
    [AssetAndUnitSummaryRow.WBS]: string;
    [AssetAndUnitSummaryRow.資産名称]: string;
    [AssetAndUnitSummaryRow.資産テキスト]: string;
    [AssetAndUnitSummaryRow.資産クラス名称]: string;
    [AssetAndUnitSummaryRow.事業コード名]: string;
    [AssetAndUnitSummaryRow.取得日付]: Date;
};

export type AssetAndUnitSummary = {
    sapWbsCode: string;
    assetName: string;
    assetText: string;
    assetClassName: string;
    businessCodeName: string;
    sapRecordedAt: Date;
};

export class AssetAndUnitSheet {
    private _assetAndUnitSummaries: AssetAndUnitSummary[];
    constructor(public book: WorkBook) {
        this._assetAndUnitSummaries = this.buildAssetAndunitSummaries();
    }
    private buildAssetAndunitSummaries(): AssetAndUnitSummary[] {
        const summaryRows = XLSX.utils.sheet_to_json<AssetAndUnitSummaryRowKey>(
            this.assetAndUnitSheet,
        );

        const contentStartIdx = 1;
        return (
            summaryRows
                .slice(contentStartIdx)
                .filter(r => r[AssetAndUnitSummaryRow.WBS] !== '')
                // 18列目以降の場合、セルが空だとkey自体が消えるため(17行目までは空文字が入るのに)、取得日付がundefinedの時は行ごと消す
                .filter(r => r[AssetAndUnitSummaryRow.取得日付])
                .map(r => {
                    return {
                        sapWbsCode: r[AssetAndUnitSummaryRow.WBS],
                        assetName: r[AssetAndUnitSummaryRow.資産名称],
                        assetText: r[AssetAndUnitSummaryRow.資産テキスト],
                        assetClassName:
                            r[AssetAndUnitSummaryRow.資産クラス名称],
                        businessCodeName:
                            r[AssetAndUnitSummaryRow.事業コード名],
                        sapRecordedAt: excelConvertedDateToJst(
                            r[AssetAndUnitSummaryRow.取得日付],
                        ),
                    };
                })
        );
    }

    public get assetAndUnitSummaries(): AssetAndUnitSummary[] {
        return this._assetAndUnitSummaries;
    }

    private get assetAndUnitSheet(): Sheet {
        return this.book.Sheets['資産数量・単位記入シート'];
    }
}
