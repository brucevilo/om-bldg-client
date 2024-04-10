import { ProjectByYearWithWBSAndCS } from './../Entity/ProjectWbsByYearAndCS';
import {
    ConstructionFactory,
    ConstructionResponse,
} from './ConstructionFactory';
import { WBSFactory, WBSResponse } from './WBSFactory';

export interface ProjectByYearWithWbsAndCSResponse {
    id: number;
    no: number;
    code: string;
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
    constructions: ConstructionResponse[];
    wbs: WBSResponse;
}

export class ProjectByYearWithWBSAndCSFactory {
    static createFromResponse(
        res: ProjectByYearWithWbsAndCSResponse,
    ): ProjectByYearWithWBSAndCS {
        const projectConstructions =
            res.constructions?.map(ConstructionFactory.createFromResponse) ||
            null;
        const wbs = WBSFactory.createFromResponse(res.wbs);
        return new ProjectByYearWithWBSAndCS(
            res.id,
            res.no,
            res.code,
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
            projectConstructions,
            wbs,
        );
    }
}
