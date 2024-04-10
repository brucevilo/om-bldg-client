import { ProjectByYearWithWBS, WbsByYear } from '../Entity/ProjectWbsByYear';
import {
    ConstructionFactory,
    ConstructionResponse,
} from './ConstructionFactory';

export interface ProjectByYearWithWbsResponse {
    id: number;
    wbs_level1: string;
    target_year: number;
    name: string;
    wbs: WbsbByYearResponse | null;
    created_at: Date;
    updated_at: Date;
    constructions: ConstructionResponse[];
}

export interface WbsbByYearResponse {
    april: number;
    may: number;
    june: number;
    july: number;
    august: number;
    september: number;
    october: number;
    november: number;
    december: number;
    january: number;
    february: number;
    march: number;
    first_year: number;
    second_year: number;
    third_year: number;
    fourth_year: number;
}

export class ProjectByYearWithWBSFactory {
    static createFromResponse(
        res: ProjectByYearWithWbsResponse,
    ): ProjectByYearWithWBS {
        const projectWbs = res.wbs
            ? new WbsByYear(
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
                  res.wbs.first_year,
                  res.wbs.second_year,
                  res.wbs.third_year,
                  res.wbs.fourth_year,
              )
            : null;

        const projectConstructions =
            res.constructions?.map(ConstructionFactory.createFromResponse) ||
            null;
        return new ProjectByYearWithWBS(
            res.id,
            res.target_year,
            res.wbs_level1,
            res.name,
            res.created_at,
            res.updated_at,
            projectWbs,
            projectConstructions,
        );
    }
}
