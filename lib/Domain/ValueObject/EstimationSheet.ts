import { chunk } from 'lodash';
import XLSX, { WorkBook, Sheet } from 'xlsx';
import { ConstructionType } from '.';

export const COST_ITEM_SUMMARY_SHEET_NAME = '明細項目情報';
export const CONSTRUCTION_STATEMENT_SUMMARY_SHEET_NAME = '工事明細情報';
export const COLLATERAL_CONSTRUCTION_STATEMENT_SUMMARY_SHEET_NAME =
    '附帯工事明細情報';

export type AssetInfo = {
    name: string;
    code: number;
    price?: number;
};

type Classification = '費用' | '資産';

type CostItemSummaryRow = {
    '工事': string;
    '工期': string;
    '明細項目名': string;
    '工種': ConstructionType;
    '単価コード': number | null;
    '形状寸法': string;
    '数量': number;
    '単位': string;
    '単価': number;
    '金額': number;
    '作業時間': string;
    '運搬時間': string;
    '摘要': string;
    '資産クラス特定情報': string;
    '※特定情報1': string | null;
    '※特定情報2': string | null;
    '※特定情報3': string | null;
    '※特定情報4': string | null;
};

export type CostItemSummary = {
    constructionName: string;
    term: string;
    name: string;
    constructionType: ConstructionType;
    priceCode: number | null;
    dimension: string;
    amount: number;
    unit: string;
    unitPrice: number;
    price: number;
    constructionTime: string;
    transportationTime: string;
    remarks: string;
    assetClassInfo: string;
    tags: string[];
};

type ConstructionStatementSummaryRow = {
    '工事': string;
    '費用or資産': Classification;
    '資産①資産クラスコード': number;
    '資産①資産名称': string;
    '資産②資産クラスコード': number;
    '資産②資産名称': string;
    '資産③資産クラスコード': number;
    '資産③資産名称': string;
    '資産④資産クラスコード': number;
    '資産④資産名称': string;
    '資産⑤資産クラスコード': number;
    '資産⑤資産名称': string;
    '資産⑥資産クラスコード': number;
    '資産⑥資産名称': string;
    '資産⑦資産クラスコード': number;
    '資産⑦資産名称': string;
    '資産⑧資産クラスコード': number;
    '資産⑧資産名称': string;
    '資産⑨資産クラスコード': number;
    '資産⑨資産名称': string;
    '資産⑩資産クラスコード': number;
    '資産⑩資産名称': string;
};

type CollateralConstructionStatementSummaryRow = {
    '工事': string;
    '費用or資産': Classification;
    '費用計上金額': number;
    '資産①資産クラスコード': number;
    '資産①資産名称': string;
    '資産①資産金額': number;
    '資産②資産クラスコード': number;
    '資産②資産名称': string;
    '資産②資産金額': number;
    '資産③資産クラスコード': number;
    '資産③資産名称': string;
    '資産③資産金額': number;
    '資産④資産クラスコード': number;
    '資産④資産名称': string;
    '資産④資産金額': number;
    '資産⑤資産クラスコード': number;
    '資産⑤資産名称': string;
    '資産⑤資産金額': number;
    '資産⑥資産クラスコード': number;
    '資産⑥資産名称': string;
    '資産⑥資産金額': number;
    '資産⑦資産クラスコード': number;
    '資産⑦資産名称': string;
    '資産⑦資産金額': number;
    '資産⑧資産クラスコード': number;
    '資産⑧資産名称': string;
    '資産⑧資産金額': number;
    '資産⑨資産クラスコード': number;
    '資産⑨資産名称': string;
    '資産⑨資産金額': number;
    '資産⑩資産クラスコード': number;
    '資産⑩資産名称': string;
    '資産⑩資産金額': number;
};

const ASSET_INFO_HEADERS = [
    '資産①資産クラスコード',
    '資産①資産名称',
    '資産②資産クラスコード',
    '資産②資産名称',
    '資産③資産クラスコード',
    '資産③資産名称',
    '資産④資産クラスコード',
    '資産④資産名称',
    '資産⑤資産クラスコード',
    '資産⑤資産名称',
    '資産⑥資産クラスコード',
    '資産⑥資産名称',
    '資産⑦資産クラスコード',
    '資産⑦資産名称',
    '資産⑧資産クラスコード',
    '資産⑧資産名称',
    '資産⑨資産クラスコード',
    '資産⑨資産名称',
    '資産⑩資産クラスコード',
    '資産⑩資産名称',
];

const COLLATERAL_CONSTRUCTION_ASSET_INFO_HEADERS = [
    '資産①資産クラスコード',
    '資産①資産名称',
    '資産①資産金額',
    '資産②資産クラスコード',
    '資産②資産名称',
    '資産②資産金額',
    '資産③資産クラスコード',
    '資産③資産名称',
    '資産③資産金額',
    '資産④資産クラスコード',
    '資産④資産名称',
    '資産④資産金額',
    '資産⑤資産クラスコード',
    '資産⑤資産名称',
    '資産⑤資産金額',
    '資産⑥資産クラスコード',
    '資産⑥資産名称',
    '資産⑥資産金額',
    '資産⑦資産クラスコード',
    '資産⑦資産名称',
    '資産⑦資産金額',
    '資産⑧資産クラスコード',
    '資産⑧資産名称',
    '資産⑧資産金額',
    '資産⑨資産クラスコード',
    '資産⑨資産名称',
    '資産⑨資産金額',
    '資産⑩資産クラスコード',
    '資産⑩資産名称',
    '資産⑩資産金額',
];

type AssetClassCodeHeader =
    | '資産①資産クラスコード'
    | '資産②資産クラスコード'
    | '資産③資産クラスコード'
    | '資産④資産クラスコード'
    | '資産⑤資産クラスコード'
    | '資産⑥資産クラスコード'
    | '資産⑦資産クラスコード'
    | '資産⑧資産クラスコード'
    | '資産⑨資産クラスコード'
    | '資産⑩資産クラスコード';

type AssetNameHeader =
    | '資産①資産名称'
    | '資産②資産名称'
    | '資産③資産名称'
    | '資産④資産名称'
    | '資産⑤資産名称'
    | '資産⑥資産名称'
    | '資産⑦資産名称'
    | '資産⑧資産名称'
    | '資産⑨資産名称'
    | '資産⑩資産名称';

type AssetPriceHeader =
    | '資産①資産金額'
    | '資産②資産金額'
    | '資産③資産金額'
    | '資産④資産金額'
    | '資産⑤資産金額'
    | '資産⑥資産金額'
    | '資産⑦資産金額'
    | '資産⑧資産金額'
    | '資産⑨資産金額'
    | '資産⑩資産金額';

export type ConstructionStatementSummary = {
    isCollateral: boolean;
    name: string;
    cost?: number;
    classification: Classification;
    assetInfos: AssetInfo[];
};

export class EstimationSheet {
    private _costItemSummaries: CostItemSummary[];
    private _constructionStatementSummaries: ConstructionStatementSummary[];

    constructor(public book: WorkBook) {
        this._costItemSummaries = this.buildCostItemSummaries();
        this._constructionStatementSummaries =
            this.buildConstructionStatementSummaries();
    }

    private buildCostItemSummaries(): CostItemSummary[] {
        const summaryRows = XLSX.utils.sheet_to_json<CostItemSummaryRow>(
            this.costItemSummarySheet,
        );
        return summaryRows.map(r => {
            return {
                constructionName: r['工事'],
                term: r['工期'],
                name: r['明細項目名'],
                constructionType: r['工種'],
                priceCode: r['単価コード'] || null,
                dimension: r['形状寸法'] || '',
                amount: r['数量'],
                unit: r['単位'],
                unitPrice: r['単価'] || 0,
                price: r['金額'],
                constructionTime: r['作業時間'] || '',
                transportationTime: r['運搬時間'] || '',
                remarks: r['摘要'] || '',
                assetClassInfo: r['資産クラス特定情報'] || '',
                tags: [
                    r['※特定情報1'],
                    r['※特定情報2'],
                    r['※特定情報3'],
                    r['※特定情報4'],
                ].filter(tag => !!tag) as string[],
            };
        });
    }

    private buildConstructionStatementSummaries(): ConstructionStatementSummary[] {
        const summaryRows =
            XLSX.utils.sheet_to_json<ConstructionStatementSummaryRow>(
                this.constructionStatementSummarySheet,
            );
        return summaryRows.map(r => {
            return {
                isCollateral: false,
                name: r['工事'],
                classification: r['費用or資産'],
                assetInfos: chunk(ASSET_INFO_HEADERS, 2)
                    .filter(
                        ([code, name]) =>
                            r[code as AssetClassCodeHeader] &&
                            r[name as AssetNameHeader],
                    )
                    .map(([code, name]) => {
                        return {
                            code: Number(r[code as AssetClassCodeHeader]),
                            name: r[name as AssetNameHeader],
                        };
                    }),
            };
        });
    }

    public get costItemSummaries(): CostItemSummary[] {
        return this._costItemSummaries;
    }

    public get consturciontStatementSummaries(): ConstructionStatementSummary[] {
        return this._constructionStatementSummaries;
    }

    public get collateralConstructionStatementSummaries(): ConstructionStatementSummary[] {
        return XLSX.utils
            .sheet_to_json<CollateralConstructionStatementSummaryRow>(
                this.collateralConstructionStatementSummarySheet,
            )
            .map(r => ({
                isCollateral: true,
                name: r['工事'],
                classification: r['費用or資産'],
                cost: r['費用計上金額'],
                assetInfos: chunk(COLLATERAL_CONSTRUCTION_ASSET_INFO_HEADERS, 3)
                    .filter(
                        ([code, name, price]) =>
                            r[code as AssetClassCodeHeader] &&
                            r[name as AssetNameHeader] &&
                            r[price as AssetPriceHeader],
                    )
                    .map(([code, name, price]) => ({
                        code: Number(r[code as AssetClassCodeHeader]),
                        name: r[name as AssetNameHeader],
                        price: Number(r[price as AssetPriceHeader]),
                    })),
            }));
    }

    private get costItemSummarySheet(): Sheet {
        return this.book.Sheets[COST_ITEM_SUMMARY_SHEET_NAME];
    }

    private get constructionStatementSummarySheet(): Sheet {
        return this.book.Sheets[CONSTRUCTION_STATEMENT_SUMMARY_SHEET_NAME];
    }

    private get collateralConstructionStatementSummarySheet(): Sheet {
        return this.book.Sheets[
            COLLATERAL_CONSTRUCTION_STATEMENT_SUMMARY_SHEET_NAME
        ];
    }
}
