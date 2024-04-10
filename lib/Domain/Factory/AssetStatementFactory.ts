import { AssetStatement } from '../Entity';
import { AssetClassResponse, AssetClassFactory } from '.';

export interface AssetStatementResponse {
    id: number;
    construction_statement_id: number;
    asset_class: AssetClassResponse | null;
    name: string;
    distributed_price: number;
    sap_key: string;
    sap_recorded_at: string;
    sap_recorded_price: number;
    is_privatized: boolean;
    sap_fixed_asset_id: number;
    construction_type_serial_number: number | null;
    distributed_design_cost: number;
    assessment_price: number | null;
    created_at: string;
    updated_at: string;
    buildings_id: number | null;
}

export class AssetStatementFactory {
    static createFromResponse(res: AssetStatementResponse): AssetStatement {
        return new AssetStatement(
            res.id,
            res.construction_statement_id,
            res.asset_class
                ? AssetClassFactory.createFromResponse(res.asset_class)
                : null,
            res.name,
            res.distributed_price,
            res.sap_key,
            res.sap_recorded_at ? new Date(res.sap_recorded_at) : null,
            res.sap_recorded_price,
            res.is_privatized,
            res.sap_fixed_asset_id,
            res.construction_type_serial_number,
            res.distributed_design_cost,
            res.assessment_price,
            new Date(res.created_at),
            new Date(res.updated_at),
            res.buildings_id,
        );
    }
}
