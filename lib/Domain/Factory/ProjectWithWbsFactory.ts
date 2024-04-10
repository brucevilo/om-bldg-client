import { ProjectsWithWBS, Wbs } from '../Entity/ProjectWBS';
export interface ProjectWithWbsResponse {
    id: number;
    no: number;
    budget: number;
    note: string;
    target_year: number;
    budget_division: number;
    large_investment: string;
    medium_investment: string;
    small_investment: string;
    government_report: string;
    wbs_level1: string;
    name: string;
    financial_classification: string;
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
    wbs_level2: string | null;
    input_level2: string | null;
    spare_item1: string | null;
    spare_item2: string | null;
    spare_item3: string | null;
    created_at: Date;
    updated_at: Date;
    wbs: WbsResponse | null;
}

export interface WbsResponse {
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
    midterm_total: number;
    first_year: number | null;
    second_year: number | null;
    third_year: number | null;
    fourth_year: number | null;
    created_at: Date;
    updated_at: Date;
}

export class ProjectWithWBSFactory {
    static createFromResponse(res: ProjectWithWbsResponse): ProjectsWithWBS {
        const projectWbs = res.wbs
            ? new Wbs(
                  res.wbs.accounting_code,
                  res.wbs.accounting_name,
                  res.wbs.asset_class_code,
                  res.wbs.asset_class_name,
                  res.wbs.april,
                  res.wbs.may,
                  res.wbs.june,
                  res.wbs.july,
                  res.wbs.august,
                  res.wbs.september,
                  res.wbs.october,
                  res.wbs.november,
                  res.wbs.december,
                  res.wbs.january,
                  res.wbs.february,
                  res.wbs.march,
                  res.wbs.annual_total,
                  res.wbs.midterm_total,
                  res.wbs.first_year,
                  res.wbs.second_year,
                  res.wbs.third_year,
                  res.wbs.fourth_year,
                  res.wbs.created_at,
                  res.wbs.updated_at,
              )
            : null;

        return new ProjectsWithWBS(
            res.id,
            res.no,
            res.budget,
            res.note,
            res.target_year,
            res.budget_division,
            res.large_investment,
            res.medium_investment,
            res.small_investment,
            res.government_report,
            res.wbs_level1,
            res.name,
            res.financial_classification,
            res.classification,
            res.segment_code,
            res.segment_name,
            res.line_code,
            res.line_name,
            res.station_code,
            res.station_name,
            res.construction_section_code,
            res.construction_section_name,
            res.budget_purpose,
            res.wbs_level2,
            res.input_level2,
            res.spare_item1,
            res.spare_item2,
            res.spare_item3,
            res.created_at,
            res.updated_at,
            projectWbs,
        );
    }
}
