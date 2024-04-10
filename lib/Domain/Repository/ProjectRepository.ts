import { ProjectByYearWithWBSAndCS } from './../Entity/ProjectWbsByYearAndCS';
import {
    ProjectByYearWithWBSAndCSFactory,
    ProjectByYearWithWbsAndCSResponse,
} from './../Factory/ProjectByYearAndCsFactory';
import { WBSFactory, WBSResponse } from './../Factory/WBSFactory';
import { getClient } from '@/Infrastructure';
import {
    ProjectResponse,
    ProjectFactory,
    ProjectByYearWithWbsResponse,
    ProjectByYearWithWBSFactory,
    ProjectWithWbsResponse,
    ProjectWithWBSFactory,
} from '../Factory';
import {
    Project,
    Design,
    Construction,
    ProjectClassification,
    WBS,
    ProjectsWithWBS,
} from '../Entity';
import { ProjectByYearWithWBS } from '@/Domain/Entity/ProjectWbsByYear';
import { MappedFetchPagenateData } from '@/App/Service';

interface EditProjectRequest {
    name: string;
    code: string;
    budget: number;
    file?: File | null;
    note: string;
    classification: ProjectClassification;
    design_ids?: number[];
    construction_ids?: number[];
}
interface WBSRequest {
    wbs: string;
    wbsFile?: File | null;
    note: string;
}
export interface WbsRowRequest {
    no: number;
    id?: number | null;
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

export class ProjectRepository {
    static async index(): Promise<Project[]> {
        const res = await getClient().get<ProjectResponse[]>('/projects');
        return res.data.map(ProjectFactory.createFromResponse);
    }

    static async search(
        page: number,
        keyword: string,
    ): Promise<MappedFetchPagenateData<Project>> {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        query.append('keyword', keyword);
        const res = await getClient().get<ProjectResponse[]>(
            `/projects?${query}`,
        );
        return {
            values: res.data.map(ProjectFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async listByDesign(design: Design): Promise<Project[]> {
        const res = await getClient().get<ProjectResponse[]>(
            `/designs/${design.id}/projects`,
        );
        return res.data.map(ProjectFactory.createFromResponse);
    }

    static async listByConstruction(
        construction: Construction,
    ): Promise<Project[]> {
        const res = await getClient().get<ProjectResponse[]>(
            `/constructions/${construction.id}/projects`,
        );
        return res.data.map(ProjectFactory.createFromResponse);
    }

    static async get(id: number): Promise<Project> {
        const res = await getClient().get<ProjectResponse>(`/projects/${id}`);
        return ProjectFactory.createFromResponse(res.data);
    }

    static async getWithWBS(
        classification: string[] | null,
        largeInvestment: string[] | null,
        project: string[] | null,
        wbsLevel2: string[] | null,
        search: string,
    ): Promise<ProjectsWithWBS[]> {
        const params = new URLSearchParams();
        params.append('search', search);
        classification &&
            params.append('classification', classification?.toString());
        wbsLevel2 && params.append('wbs_level2', wbsLevel2?.toString());
        project && params.append('project', project?.toString());
        largeInvestment &&
            params.append('large_investment', largeInvestment?.toString());

        const res = await getClient().get<ProjectWithWbsResponse[]>(
            `/wbs?${params}`,
        );
        return res.data.map(ProjectWithWBSFactory.createFromResponse);
    }

    static relationParams(
        designs?: Design[],
        constructions?: Construction[],
    ): Partial<EditProjectRequest> {
        if (!designs) return {};
        return {
            'design_ids': designs.map(d => d.id as number),
            'construction_ids': constructions?.map(c => c.id as number),
        };
    }

    static async create(
        { name, code, budget, file, note, classification }: Project,
        designs?: Design[],
        constructions?: Construction[],
    ): Promise<Project> {
        const fileParams = file ? { file } : {};
        const res = await getClient().formPost<
            EditProjectRequest,
            ProjectResponse
        >(`/projects`, {
            name,
            code,
            budget,
            note,
            classification,
            ...fileParams,
            ...this.relationParams(designs, constructions),
        });
        return ProjectFactory.createFromResponse(res.data);
    }

    static async update(
        { id, name, code, budget, file, note, classification }: Project,
        designs?: Design[],
        constructions?: Construction[],
    ): Promise<Project> {
        const fileParams = file ? { file } : {};
        const res = await getClient().formPatch<
            EditProjectRequest,
            ProjectResponse
        >(`/projects/${id}`, {
            name,
            code,
            budget,
            ...fileParams,
            note,
            classification,
            ...this.relationParams(designs, constructions),
        });
        return ProjectFactory.createFromResponse(res.data);
    }

    static async delete(project: Project): Promise<void> {
        await getClient().delete(`/projects/${project.id}`);
    }

    static async listByCurrentYear(
        targetYear: string,
    ): Promise<ProjectByYearWithWBS[]> {
        const urlSearchParams = new URLSearchParams({
            target_year: targetYear,
        });
        const res = await getClient().get<ProjectByYearWithWbsResponse[]>(
            `/wbs?${urlSearchParams}`,
        );
        return res.data.map(ProjectByYearWithWBSFactory.createFromResponse);
    }

    static async listByCurrentYearWithCS(
        targetYear: string,
    ): Promise<ProjectByYearWithWBSAndCS[]> {
        const urlSearchParams = new URLSearchParams({
            target_year: targetYear,
        });
        const res = await getClient().get<ProjectByYearWithWbsAndCSResponse[]>(
            `/list_project_by_target_year_and_contract?${urlSearchParams}`,
        );
        return res.data.map(
            ProjectByYearWithWBSAndCSFactory.createFromResponse,
        );
    }

    static async createWBS(
        wbs: WbsRowRequest[],
        wbsFile: File,
        note: string,
    ): Promise<WBS> {
        const fileParams = wbsFile ? { wbsFile } : {};
        const res = await getClient().formPost<WBSRequest, WBSResponse>(
            `/wbs/`,
            {
                wbs,
                ...fileParams,
                note,
            },
        );
        return WBSFactory.createFromResponse(res.data);
    }
}
