import { Price } from '../Entity';

export interface PriceResponse {
    id: number;
    code: string;
    name: string;
    shape_dimension: string;
    price: number;
    created_at: string;
    updated_at: string;
}

export class PriceFactory {
    static createFromResponse(res: PriceResponse): Price {
        return new Price(
            res.id,
            res.code,
            res.name,
            res.shape_dimension,
            res.price,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
