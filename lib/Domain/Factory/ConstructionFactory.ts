import { Construction, MigrationStatus } from '@/Domain/Entity';
import { DocumentNumber } from '../ValueObject/DocumentNumber';
import { ContractFactory, ContractResponse } from './ContractFactory';

export interface ConstructionResponse {
    id: number;
    name: string;
    contracts: ContractResponse[];
    document_number: string;
    created_at: string;
    updated_at: string;
    made_by_migration: boolean;
    migration_status: MigrationStatus;
}

export class ConstructionFactory {
    static createFromResponse(res: ConstructionResponse): Construction {
        const contracts = res.contracts
            ? res.contracts.map(ContractFactory.createFromResponse)
            : [];

        return new Construction(
            res.id,
            res.name,
            new DocumentNumber(res.document_number),
            contracts,
            new Date(res.created_at),
            new Date(res.updated_at),
            res.made_by_migration,
            res.migration_status,
        );
    }
}
