import { Design, DesignContractType } from '@/Domain/Entity/Design';
import { MigrationStatus } from '../Entity';
import { DocumentNumber } from '../ValueObject/DocumentNumber';
import { ContractFactory, ContractResponse } from './ContractFactory';

export interface DesignResponse {
    id: number;
    name: string;
    contract_type: DesignContractType;
    memo: string;
    document_number: string | null;
    contracts?: ContractResponse[];
    created_at: string;
    updated_at: string;
    made_by_migration: boolean;
    migration_status: MigrationStatus;
}

export class DesignFactory {
    static createFromResponse(res: DesignResponse): Design {
        const contracts = res.contracts
            ? res.contracts.map(ContractFactory.createFromResponse)
            : [];

        return new Design(
            res.id,
            res.name,
            res.contract_type,
            res.memo,
            res.document_number
                ? new DocumentNumber(res.document_number)
                : null,
            contracts,
            new Date(res.created_at),
            new Date(res.updated_at),
            res.made_by_migration,
            res.migration_status,
        );
    }
}
