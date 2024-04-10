import { getClient } from '@/Infrastructure';
import {
    ConstructionFactory,
    ConstructionResponse,
    ActionHistoryFactory,
    ActionHistoryResponse,
} from '../Factory';
import {
    ActionHistory,
    Construction,
    Contract,
    Design,
    Project,
} from '../Entity';
import { MappedFetchPagenateData } from '@/App/Service';

interface EditConstructionRequest {
    design_ids?: number[];
    project_ids?: number[];
    name?: string;
    document_number: string;
    spec_file?: File | null;
    cost_document?: File | null;
    made_by_migration?: boolean;
}

export class ConstructionRepository {
    static async get(id: number): Promise<Construction> {
        const res = await getClient().get<ConstructionResponse>(
            `/constructions/${id}`,
        );
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async mgetByContracts(
        contractIds: number[],
    ): Promise<Construction[]> {
        const query = new URLSearchParams();
        query.append('contract_ids', contractIds.toString());
        const res = await getClient().get<ConstructionResponse[]>(
            `/constructions/mget_by_contracts?${query}`,
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async mgetByContractsAndConstructionStatement(): Promise<
        Construction[]
    > {
        const res = await getClient().get<ConstructionResponse[]>(
            '/constructions/construction_contract_and_cs',
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async getActionHistories(id: number): Promise<ActionHistory[]> {
        const res = await getClient().get<ActionHistoryResponse[]>(
            `/constructions/${id}/action_histories`,
        );
        return res.data.map(ActionHistoryFactory.createFromResponse);
    }

    static async index(): Promise<Construction[]> {
        const res = await getClient().get<ConstructionResponse[]>(
            '/constructions',
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async search(
        keyword: string,
        nextAction: string,
        page: number,
        shouldFilterMigration?: boolean,
    ): Promise<MappedFetchPagenateData<Construction>> {
        const params = new URLSearchParams({
            keyword,
            page: page.toString(),
            next_action: nextAction,
        });
        shouldFilterMigration &&
            params.append('should_filter_migration', 'true');
        const res = await getClient().get<ConstructionResponse[]>(
            `/constructions?${params.toString()}`,
        );
        const values = res.data.map(ConstructionFactory.createFromResponse);
        return {
            values,
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async listInProgressByKeyword(
        keyword: string,
    ): Promise<Construction[]> {
        const params = new URLSearchParams({
            keyword,
            cips: 'true',
        });
        const res = await getClient().get<ConstructionResponse[]>(
            `/constructions?${params.toString()}`,
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async listByDesign(design: Design): Promise<Construction[]> {
        const res = await getClient().get<ConstructionResponse[]>(
            `/designs/${design.id}/constructions`,
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async listByProject(project: Project): Promise<Construction[]> {
        const res = await getClient().get<ConstructionResponse[]>(
            `/projects/${project.id}/constructions`,
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async getByContract(contractId: number): Promise<Construction> {
        const query = new URLSearchParams();
        query.append('contract_id', contractId.toString());
        const res = await getClient().get<ConstructionResponse>(
            `/constructions?${query}`,
        );
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async mgetByProjects(projects: Project[]): Promise<Construction[]> {
        const res = await getClient().get<ConstructionResponse[]>(
            `/constructions?project_ids=${projects.map(p => p.id).join(',')}`,
        );
        return res.data.map(ConstructionFactory.createFromResponse);
    }

    static async create(
        { name, documentNumber, madeByMigration }: Partial<Construction>,
        {}: Partial<Contract>,
        projects?: Project[],
        designs?: Design[],
    ): Promise<Construction> {
        const params: EditConstructionRequest = {
            design_ids: designs?.map(d => d.id as number),
            project_ids: projects?.map(p => p.id as number),
            name: name || '',
            document_number: documentNumber?.value || '',
            made_by_migration: madeByMigration,
        };
        const res = await getClient().post<
            EditConstructionRequest,
            ConstructionResponse
        >(`/constructions`, params);
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async updateDocumentNumber(
        id: number,
        documentNumber: string,
    ): Promise<Construction> {
        const params: EditConstructionRequest = {
            document_number: documentNumber,
        };
        const res = await getClient().patch<
            EditConstructionRequest,
            ConstructionResponse
        >(`/constructions/${id}`, params);
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async update(
        { id, name, documentNumber }: Partial<Construction>,
        { specFile, costDocument }: Partial<Contract>,
        projects?: Project[],
        designs?: Design[],
    ): Promise<Construction> {
        const params: EditConstructionRequest = {
            design_ids: designs?.map(d => d.id as number),
            project_ids: projects?.map(p => p.id as number),
            spec_file: specFile,
            cost_document: costDocument,
            name: name || '',
            document_number: documentNumber?.value || '',
        };
        const res = await getClient().patch<
            EditConstructionRequest,
            ConstructionResponse
        >(`/constructions/${id}`, params);
        return ConstructionFactory.createFromResponse(res.data);
    }

    static async delete(construction: Construction): Promise<void> {
        await getClient().delete(`/constructions/${construction.id}`);
    }

    static async updateSapRecordImportManageSheet(
        constructionId: number,
        file: File,
    ): Promise<void> {
        await getClient().formPatch(
            `/constructions/${constructionId}/sap_record_import_manage_sheet`,
            {
                file,
            },
        );
    }

    static async deleteContractChange(id: number): Promise<void> {
        await getClient().delete(`/constructions/${id}/delete_contract_change`);
    }
}
