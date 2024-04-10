import { WBS } from '../Entity';
export interface WbsRow {
    no: number;
    target_year: number;
    budget_division: number;
    midterm_total: number;
    large_investment: string;
    medium_investment: string;
    small_investment: string;
    government_report: string;
    wbs_level1: string;
    name: string;
    classification: string;
    segment_code: string;
    segment_name: string;
    line_code: string;
    line_name: string;
    station_code: string;
    station_name: string;
    construction_section_code: string;
    construction_section_name: string;
    budget_purpose: string;
    accounting_code: string;
    accounting_name: string;
    asset_class_code: string | null;
    asset_class_name: string | null;
    april: number | null;
    may: number | null;
    june: number | null;
    july: number | null;
    august: number | null;
    september: number | null;
    october: number | null;
    november: number | null;
    december: number | null;
    january: number | null;
    february: number | null;
    march: number | null;
    annual_total: number | null;
    first_year: number | null;
    second_year: number | null;
    third_year: number | null;
    fourth_year: number | null;
    wbs_level2: string | null;
    input_level2: string | null;
    spare_item1: string | null;
    spare_item2: string | null;
    spare_item3: string | null;
}
export interface WBSResponse extends WbsRow {
    id: number | null;
    project_id: number;
    created_at: Date;
    updated_at: Date;
}
export class WBSFactory {
    static createFromResponse(res: WBSResponse): WBS {
        return new WBS(
            res.id,
            res.no,
            res.target_year,
            res.budget_division,
            res.midterm_total,
            res.large_investment,
            res.medium_investment,
            res.small_investment,
            res.government_report,
            res.wbs_level1,
            res.name,
            res.classification,
            res.project_id,
            res.segment_code,
            res.segment_name,
            res.line_code,
            res.line_name,
            res.station_code,
            res.station_name,
            res.construction_section_code,
            res.construction_section_name,
            res.budget_purpose,
            res.accounting_code,
            res.accounting_name,
            res.asset_class_code,
            res.asset_class_name,
            res.april,
            res.may,
            res.june,
            res.july,
            res.august,
            res.september,
            res.october,
            res.november,
            res.december,
            res.january,
            res.february,
            res.march,
            res.annual_total,
            res.first_year,
            res.second_year,
            res.third_year,
            res.fourth_year,
            res.wbs_level2,
            res.input_level2,
            res.spare_item1,
            res.spare_item2,
            res.spare_item3,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
