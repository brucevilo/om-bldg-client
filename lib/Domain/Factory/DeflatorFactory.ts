import { Deflator } from '../Entity';

export interface DeflatorResponse {
    id: number;
    year: number;
    rate: number;
    created_at: string;
    updated_at: string;
}

export class DeflatorFactory {
    static createFromResponse(res: DeflatorResponse): Deflator {
        return new Deflator(
            res.id,
            res.year,
            res.rate,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
