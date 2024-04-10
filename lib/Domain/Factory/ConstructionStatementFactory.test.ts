import {
    CostItemResponse,
    ConstructionStatementResponse,
    ConstructionStatementFactory,
    AssetClassResponse,
    CostItemTagResponse,
    AssetChecklistResponse,
} from '.';
import { Classification } from '@/Domain/Entity';
import { dummyRetirementResponse } from '@/__test__/dummy';

test('レスポンスから工事明細を作成', () => {
    const assetClass: AssetClassResponse = {
        id: 1,
        name: '鉄有固-運送施設 建物-鉄骨鉄筋コンクリート造又は鉄筋コンクリート造-停車場建物',
        'account_division': '鉄コン造',
        code: 10000,
        'useful_life': 30,
        category: '建築仕上げ',
        'account_item_moku': '007停留場建物',
        'account_item_kou': '05建物',
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-01').toISOString(),
    };
    const tags: CostItemTagResponse[] = [
        {
            id: 1,
            'cost_item_id': 1,
            name: 'コスモスクエア駅',
            'created_at': new Date('2020-01-01').toISOString(),
            'updated_at': new Date('2020-01-01').toISOString(),
        },
    ];
    const assetChecklists: AssetChecklistResponse[] = [
        {
            id: 1,
            user_id: 1,
            'created_at': new Date('2020-01-01').toISOString(),
            'updated_at': new Date('2020-01-02').toISOString(),
        },
    ];
    const costItem: CostItemResponse = {
        id: 1,
        'construction_statement_id': 1,
        name: '磁器スタイル張',
        code: 309,
        'construction_type': 'タイル工事',
        dimension: '300×600　一晩施工',
        amount: 39.7,
        unit: '㎡',
        'unit_price': 34_200,
        price: 1_357_740,
        'construction_time': '4A',
        'transportation_time': '4A',
        remarks: '代価',
        'asset_class': assetClass,
        'cost_item_tags': tags,
        'asset_checklists': assetChecklists,
        memo: 'メモ',
        'photos_info': [{ path: 'xxx', filename: 'xxx.png' }],
        merged_cost_item_id: null,
        estimate_amount: null,
        estimate_price: null,
        asset_class_info: null,
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };
    const retirement = dummyRetirementResponse();
    const res: ConstructionStatementResponse = {
        id: 1,
        'contract_id': 1,
        name: 'ア）東梅田駅-可動式ホーム柵設置に伴う建築工事',
        project_code: '1',
        term: new Date('2020-02-01').toISOString(),
        'cost_items': [costItem],
        classification: Classification.Asset,
        is_retiremented: false,
        is_construction_in_progress_completed: false,
        retirement,
        scheduled_acceptance_date: new Date('2020-11-11').toISOString(),
        is_collateral: false,
        previous_construction_statement_id: null,
        previous_construction_statement: {
            id: 2,
            'contract_id': 2,
            name: 'ア）東梅田駅-可動式ホーム柵設置に伴う建築工事-前回',
            project_code: '111',
            term: new Date('2020-01-01').toISOString(),
            classification: Classification.Asset,
            is_retiremented: false,
            is_construction_in_progress_completed: false,
            scheduled_acceptance_date: new Date('2020-01-01').toISOString(),
            is_collateral: false,
            'created_at': new Date('2019-12-30').toISOString(),
            'updated_at': new Date('2019-12-31').toISOString(),
        },
        contract: null,
        construction_statement_histories: null,

        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };

    const constructionStatement =
        ConstructionStatementFactory.createFromResponse(res);
    expect(constructionStatement.id).toBe(res.id);
    expect(constructionStatement.contractId).toBe(res.contract_id);
    expect(constructionStatement.name).toBe(res.name);
    expect(constructionStatement.term.toISOString()).toBe(res.term);
    expect(constructionStatement.isRetiremented).toBe(res.is_retiremented);
    expect(constructionStatement.isConstructionInProgressCompleted).toBe(
        res.is_construction_in_progress_completed,
    );
    expect(constructionStatement.retirement?.id).toBe(retirement.id);
    expect(res.scheduled_acceptance_date).toBe(
        constructionStatement.scheduledAcceptanceDate?.toISOString(),
    );
    expect(constructionStatement.createdAt.toISOString()).toBe(res.created_at);
    expect(constructionStatement.updatedAt.toISOString()).toBe(res.updated_at);

    expect(constructionStatement.previousConstructionStatement?.id).toBe(
        res.previous_construction_statement?.id,
    );
    expect(
        constructionStatement.previousConstructionStatement?.contractId,
    ).toBe(res.previous_construction_statement?.contract_id);
    expect(constructionStatement.previousConstructionStatement?.name).toBe(
        res.previous_construction_statement?.name,
    );
    expect(
        constructionStatement.previousConstructionStatement?.term.toISOString(),
    ).toBe(res.previous_construction_statement?.term);
    expect(
        constructionStatement.previousConstructionStatement?.isRetiremented,
    ).toBe(res.previous_construction_statement?.is_retiremented);
    expect(
        constructionStatement.previousConstructionStatement
            ?.isConstructionInProgressCompleted,
    ).toBe(
        res.previous_construction_statement
            ?.is_construction_in_progress_completed,
    );
    expect(
        constructionStatement.previousConstructionStatement?.scheduledAcceptanceDate?.toISOString(),
    ).toBe(res.previous_construction_statement?.scheduled_acceptance_date);
    expect(
        constructionStatement.previousConstructionStatement?.createdAt.toISOString(),
    ).toBe(res.previous_construction_statement?.created_at);
    expect(
        constructionStatement.previousConstructionStatement?.updatedAt.toISOString(),
    ).toBe(res.previous_construction_statement?.updated_at);
});
