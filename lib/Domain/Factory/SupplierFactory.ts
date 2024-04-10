import { Supplier } from '../Entity';

export interface SupplierResponse {
    id: number;
    name: string;
    code: number;
    contact: string;
    created_at: string;
    updated_at: string;
}

export class SupplierFactory {
    static createFromResponse(res: SupplierResponse): Supplier {
        return new Supplier(
            res.id,
            res.name,
            res.code,
            res.contact,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
