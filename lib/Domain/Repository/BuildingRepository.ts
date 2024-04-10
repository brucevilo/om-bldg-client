import { getClient } from '@/Infrastructure';
import {
    BuildingResponse,
    BuildingFactory,
    ContractFactory,
    ContractResponse,
} from '../Factory';
import { Building, Contract } from '../Entity';
import { MappedFetchPagenateData } from '@/App/Service';
import { map } from 'lodash';

export class BuildingRepository {
    static async get(
        page: number,
        search: string,
        line: string | null,
        type: string | null,
    ): Promise<MappedFetchPagenateData<Building>> {
        const params = new URLSearchParams({
            page: page.toString(),
            search,
            ...(line && { line }),
            ...(type && { type }),
        });
        const res = await getClient().get<BuildingResponse[]>(
            `/buildings?${params.toString()}`,
        );
        return {
            values: res.data.map(BuildingFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async getMaster(
        searchBuilding: string,
        page: number,
    ): Promise<MappedFetchPagenateData<Building>> {
        const uriSearchParams = new URLSearchParams({
            search: searchBuilding,
            page: page.toString(),
        });
        const res = await getClient().get<BuildingResponse[]>(
            `/buildings/master?${uriSearchParams.toString()}`,
        );

        return {
            values: map(res.data, BuildingFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async getRawBuildings(
        line: string | null,
        type: string | null,
    ): Promise<Building[]> {
        const params = new URLSearchParams({
            ...(line && { line }),
            ...(type && { type }),
        });
        const res = await getClient().get<BuildingResponse[]>(
            `/raw_buildings?${params.toString()}`,
        );
        return res.data.map(BuildingFactory.createFromResponse);
    }

    static async getBuildingDetails(id: number): Promise<Building> {
        const res = await getClient().get<BuildingResponse>(`/buildings/${id}`);

        return BuildingFactory.createFromResponse(res.data);
    }

    static async getBuildingLines(): Promise<Array<string>> {
        const res = await getClient().get<string[]>('/building_lines');

        return res.data;
    }

    static async getBuildingTypes(): Promise<Array<string>> {
        const res = await getClient().get<string[]>('/building_types');

        return res.data;
    }

    static async getRelatedContracts(
        id: number,
        selected: Array<'construction' | 'design'>,
    ): Promise<Array<Contract>> {
        const params = new URLSearchParams({ selected: selected.toString() });
        const res = await getClient().get<ContractResponse[]>(
            `/buildings/${id}/related_contracts?${params.toString()}`,
        );

        return res.data.map(ContractFactory.createFromResponse);
    }
}
