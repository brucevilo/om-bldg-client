import { getClient } from '@/Infrastructure';
import {
    DesignResponse,
    DesignFactory,
    ActionHistoryFactory,
    ActionHistoryResponse,
    ConstructionResponse,
    ConstructionFactory,
} from '../Factory';
import {
    DesignContractType,
    Design,
    Project,
    Construction,
    Contract,
    ActionHistory,
} from '../Entity';
import { MappedFetchPagenateData } from '@/App/Service';

interface EditDesignRequest {
    [key: string]: unknown;
    name: string;
    design_staff_id: number | null;
    contract_type: DesignContractType;
    memo: string;
    expected_price: number;
    expected_construction_order_date_when_designing: string | null;
    expected_start_at: string | null;
    expected_end_at: string | null;
    start_at: string | null;
    end_at: string | null;
    construction_ids?: number[];
    project_ids?: number[];
    made_by_migration?: boolean;
}

export class DesignRepository {
    static async index(): Promise<Design[]> {
        const res = await getClient().get<DesignResponse[]>('/designs');
        return res.data.map(DesignFactory.createFromResponse);
    }

    static async search(
        keyword: string,
        nextAction: string,
        page: number,
        shouldFilterMigration?: boolean,
    ): Promise<MappedFetchPagenateData<Design>> {
        const params = new URLSearchParams({
            keyword,
            page: page.toString(),
            next_action: nextAction,
        });
        shouldFilterMigration &&
            params.append('should_filter_migration', 'true');
        const res = await getClient().get<DesignResponse[]>(
            `/designs?${params.toString()}`,
        );
        const values = res.data.map(DesignFactory.createFromResponse);
        return {
            values,
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async get(id: number): Promise<Design> {
        const res = await getClient().get<DesignResponse>(`/designs/${id}`);
        return DesignFactory.createFromResponse(res.data);
    }

    static async getActionHistories(id: number): Promise<ActionHistory[]> {
        const res = await getClient().get<ActionHistoryResponse[]>(
            `/designs/${id}/action_histories`,
        );
        return res.data.map(ActionHistoryFactory.createFromResponse);
    }

    static async getConstructions(id: number): Promise<Construction[]> {
        const res = await getClient().get<ConstructionResponse[]>(
            `/designs/${id}/constructions`,
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async listByConstruction(
        construction: Construction,
    ): Promise<Design[]> {
        const res = await getClient().get<DesignResponse[]>(
            `/constructions/${construction.id}/designs`,
        );
        return res.data.map(DesignFactory.createFromResponse);
    }

    static async listByProject(project: Project): Promise<Design[]> {
        const res = await getClient().get<DesignResponse[]>(
            `/projects/${project.id}/designs`,
        );
        return res.data.map(DesignFactory.createFromResponse);
    }

    static async mgetByProjects(projects: Project[]): Promise<Design[]> {
        const res = await getClient().get<DesignResponse[]>(
            `/designs?project_ids=${projects.map(p => p.id).join(',')}`,
        );
        return res.data.map(DesignFactory.createFromResponse);
    }

    static async create(
        {
            name,
            contractType,
            memo,
            documentNumber,
            madeByMigration,
        }: Partial<Design>,
        {
            designChiefId,
            designStaffId,
            expectedConstructionOrderDateWhenDesigning,
            expectedStartAt,
            expectedEndAt,
            startAt,
            endAt,
        }: Partial<Contract>,
        projects?: Project[],
        constructions?: Construction[],
    ): Promise<Design> {
        if (
            !name ||
            !designStaffId ||
            !contractType ||
            !expectedEndAt ||
            (contractType === DesignContractType.Internal && !designChiefId)
        )
            throw new Error('パラメータ不足');
        const relationParams =
            projects && constructions
                ? {
                      project_ids: projects.map(p => p.id as number),
                      construction_ids: constructions.map(c => c.id as number),
                  }
                : {};
        const res = await getClient().post<
            Partial<EditDesignRequest>,
            DesignResponse
        >('/designs', {
            name,
            design_chief_id: designChiefId,
            design_staff_id: designStaffId,
            contract_type: contractType,
            memo: memo || '',
            document_number: documentNumber,
            expected_construction_order_date_when_designing:
                expectedConstructionOrderDateWhenDesigning?.toISOString(),
            expected_start_at: expectedStartAt?.toISOString(),
            expected_end_at: expectedEndAt.toISOString(),
            start_at: startAt?.toISOString(),
            end_at: endAt?.toISOString(),
            made_by_migration: madeByMigration,
            ...relationParams,
        });
        return DesignFactory.createFromResponse(res.data);
    }

    static async update(
        { id, name, contractType, memo, documentNumber }: Partial<Design>,
        {
            designChiefId,
            designStaffId,
            expectedStartAt,
            expectedEndAt,
            startAt,
            endAt,
            expectedConstructionOrderDateWhenDesigning,
        }: Partial<Contract>,
        projects?: Project[],
        constructions?: Construction[],
    ): Promise<Design> {
        if (!name || !designStaffId || !contractType || !expectedEndAt)
            throw new Error('パラメータが不足しています');
        const relationParams =
            projects && constructions
                ? {
                      project_ids: projects.map(p => p.id as number),
                      construction_ids: constructions.map(c => c.id as number),
                  }
                : {};
        const designChiefParams = designChiefId
            ? { design_chief_id: designChiefId }
            : {};
        const params: Partial<EditDesignRequest> = {
            name,
            design_staff_id: designStaffId,
            contract_type: contractType,
            memo: memo || '',
            document_number: documentNumber?.value || '',
            expected_start_at: expectedStartAt?.toISOString() || null,
            expected_end_at: expectedEndAt.toISOString(),
            start_at: startAt?.toISOString() || null,
            end_at: endAt?.toISOString() || null,
            expected_construction_order_date_when_designing:
                expectedConstructionOrderDateWhenDesigning?.toISOString() ||
                null,
            ...designChiefParams,
            ...relationParams,
        };
        const res = await getClient().formPatch<
            Partial<EditDesignRequest>,
            DesignResponse
        >(`/designs/${id}`, params);
        return DesignFactory.createFromResponse(res.data);
    }

    static async delete(designs: Design): Promise<void> {
        await getClient().delete(`/designs/${designs.id}`);
    }

    static async deleteContractChange(id: number): Promise<void> {
        await getClient().delete(`designs/${id}/delete_contract_change`);
    }

    static async listByDIP(): Promise<Design[]> {
        const res = await getClient().get<DesignResponse[]>(
            `/design_contracts`,
        );
        return res.data.map(DesignFactory.createFromResponse);
    }
}
