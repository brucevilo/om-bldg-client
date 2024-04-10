import { getClient } from '@/Infrastructure';
import {
    ConstructionStatement,
    AssetClass,
    CostItemTag,
    ConstructionStatementHistoryFormValue,
} from '@/Domain/Entity';
import {
    ConstructionStatementResponse,
    ConstructionStatementFactory,
} from '@/Domain/Factory';
import { DateTime } from 'luxon';

export type ConstructionStatementForStore = Pick<
    ConstructionStatement,
    | 'costItems'
    | 'name'
    | 'projectCode'
    | 'term'
    | 'classification'
    | 'isCollateral'
    | 'previousConstructionStatementId'
>;

export class ConstructionStatementRepository {
    static async get(id: number): Promise<ConstructionStatement> {
        const res = await getClient().get<ConstructionStatementResponse>(
            `/construction_statements/${id}`,
        );
        return ConstructionStatementFactory.createFromResponse(res.data);
    }

    static async listByConstruction(
        constructionId: number,
        contractId: number,
    ): Promise<ConstructionStatement[]> {
        const res = await getClient().get<ConstructionStatementResponse[]>(
            `/constructions/${constructionId}/construction_statements?contract_id=${contractId}`,
        );
        return res.data.map(ConstructionStatementFactory.createFromResponse);
    }

    static async listByConstructions(
        constructionIds: number[],
        cip = false,
    ): Promise<ConstructionStatement[]> {
        const res = await getClient().get<ConstructionStatementResponse[]>(
            `/construction_statements?construction_ids=${constructionIds.join(
                ',',
            )}&cip=${cip}`,
        );
        return res.data.map(ConstructionStatementFactory.createFromResponse);
    }

    static async mget(
        ids: number[],
        costItemTags?: CostItemTag[],
    ): Promise<ConstructionStatement[]> {
        const params = {
            construction_statement_ids: ids,
            cost_item_tag_names: costItemTags && costItemTags.map(t => t.name),
        };
        const res = await getClient().post<
            {
                construction_statement_ids: number[];
                cost_item_tag_names?: string[];
            },
            ConstructionStatementResponse[]
        >('/construction_statements', params);
        return res.data.map(ConstructionStatementFactory.createFromResponse);
    }

    static async store(
        constructionStatements: ConstructionStatementForStore[],
        constructionId: number,
        assetClasses: AssetClass[],
    ): Promise<ConstructionStatement[]> {
        const params = constructionStatements.map(cs => {
            const costItemParams = cs.costItems.map(i => {
                // 資産クラスマスタと照合する
                const assetClass =
                    i.assetClass &&
                    assetClasses.find(
                        ac =>
                            ac.accountDivision ===
                            i.assetClass?.accountDivision,
                    );
                const costItemTagsParams = i.costItemTags.map(t => {
                    return {
                        name: t.name,
                    };
                });
                return {
                    'construction_statement_id': i.constructionStatementId,
                    name: i.name,
                    'construction_type': i.constructionType,
                    code: i.code,
                    dimension: i.dimension,
                    amount: i.amount,
                    unit: i.unit,
                    'unit_price': i.unitPrice,
                    price: i.price,
                    'construction_time': i.constructionTime,
                    'transportation_time': i.transportationTime,
                    remarks: i.remarks,
                    'asset_class_id': assetClass ? assetClass.id : null,
                    'cost_item_tags_attributes': costItemTagsParams,
                };
            });
            return {
                'construction_id': constructionId,
                name: cs.name,
                project_code: cs.projectCode,
                term: DateTime.fromJSDate(cs.term).toFormat('yyyy-MM-dd'),
                classification: cs.classification,
                'cost_items_attributes': costItemParams,
                'is_collateral': cs.isCollateral,
                'previous_construction_statement_id':
                    cs.previousConstructionStatementId,
            };
        });
        const res = await getClient().post<
            unknown,
            ConstructionStatementResponse[]
        >(`/constructions/${constructionId}/construction_statements`, {
            'construction_statements': params,
        });
        return res.data.map(ConstructionStatementFactory.createFromResponse);
    }

    static async updateScheduledAcceptanceDate(
        id: number,
        date: string,
    ): Promise<void> {
        await getClient().patch(`/construction_statements/${id}`, {
            scheduled_acceptance_date: date,
        });
    }

    static async updateScheduleChange(
        constructionStatementsFormValues: ConstructionStatementHistoryFormValue[],
        isDraft: boolean,
    ): Promise<void> {
        const csFormValuesRequestParams = constructionStatementsFormValues.map(
            cs => {
                return {
                    ...(cs.id && { id: cs.id }),
                    construction_statement_id: cs.constructionStatementId,
                    asset_difference: cs.assetDifference,
                    repair_fee_difference: cs.repairFeeDifference,
                    removal_fee_difference: cs.removalFeeDifference,
                    construction_period: cs.constructionPeriod,
                    scheduled_acceptance_date: cs.scheduledAcceptanceDate,
                    partial_payment: cs.partialPayment,
                    partial_payment_acceptance_date:
                        cs.partialPaymentAcceptanceDate,
                    reason_for_change: cs.reasonForChange,
                    is_draft: isDraft,
                    ...(cs.file && { file: cs.file }),
                };
            },
        );
        await getClient().formPost(`/construction_statement_histories`, {
            construction_statement_histories: csFormValuesRequestParams,
        });
    }

    static async updateConstructionStatementsScheduledAcceptanceDate(
        constructionStatements: ConstructionStatement[],
    ): Promise<void> {
        const constructionStatementRequestParams = constructionStatements.map(
            cs => {
                return {
                    id: cs.id,
                    contract_id: cs.contractId,
                    name: cs.name,
                    project_code: cs.projectCode,
                    term: cs.term,
                    cost_items: cs.costItems,
                    classification: cs.classification,
                    is_retiremented: cs.isRetiremented,
                    is_construction_in_progress_completed:
                        cs.isConstructionInProgressCompleted,
                    retirement: cs.retirement,
                    scheduled_acceptance_date: cs.scheduledAcceptanceDate,
                    created_at: cs.createdAt,
                    updated_at: cs.updatedAt,
                };
            },
        );
        await getClient().patch('/construction_statements', {
            construction_statements: constructionStatementRequestParams,
        });
    }

    static async updateConstructionStatementsTermDate(
        constructionStatements: ConstructionStatement[],
    ): Promise<void> {
        const constructionStatementRequestParams = constructionStatements.map(
            cs => {
                return {
                    id: cs.id,
                    contract_id: cs.contractId,
                    name: cs.name,
                    project_code: cs.projectCode,
                    term: cs.term,
                    cost_items: cs.costItems,
                    classification: cs.classification,
                    is_retiremented: cs.isRetiremented,
                    is_construction_in_progress_completed:
                        cs.isConstructionInProgressCompleted,
                    retirement: cs.retirement,
                    scheduled_acceptance_date: cs.scheduledAcceptanceDate,
                    created_at: cs.createdAt,
                    updated_at: cs.updatedAt,
                };
            },
        );
        await getClient().post('/construction_statements/construction_period', {
            construction_statements: constructionStatementRequestParams,
        });
    }
}
