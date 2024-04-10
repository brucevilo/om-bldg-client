import { DesignConstruction } from '@/Domain/Entity';

export interface DesignConstructionResponse {
    id: number;
    design_id: number;
    construction_id: number;
    created_at: string;
    updated_at: string;
}

export class DesignConstructionFactory {
    static createFromResponse(
        res: DesignConstructionResponse,
    ): DesignConstruction {
        return new DesignConstruction(
            res.id,
            res.design_id,
            res.construction_id,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
