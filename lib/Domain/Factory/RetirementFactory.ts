import { Retirement } from '@/Domain/Entity';
import { RetirementCostItemResponse, RetirementCostItemFactory } from './';
import { map } from 'lodash';
import { AttachmentInfo } from '@/Domain/ValueObject';

export interface RetirementResponse {
    id: number;
    construction_statement_id: 1;
    retirement_cost_items: RetirementCostItemResponse[];
    retiremented_at: string;
    construction_id: number;
    csv_ikkatu_upload_info: AttachmentInfo;
    created_at: string;
    updated_at: string;
}

export class RetirementFactory {
    static createFromResponseObject(res: RetirementResponse): Retirement {
        return new Retirement(
            res.id,
            map(
                res.retirement_cost_items,
                RetirementCostItemFactory.createFromResponseObject,
            ),
            res.construction_statement_id,
            new Date(res.retiremented_at),
            res.construction_id,
            res.csv_ikkatu_upload_info,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
