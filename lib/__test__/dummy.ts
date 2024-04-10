import {
    AssetClass,
    CostItem,
    ConstructionStatement,
    Classification,
    CostItemTag,
    AssetChecklist,
    AssetStatement,
    Deflator,
    Retirement,
    RetirementCostItem,
    Contract,
    Construction,
    MigrationStatus,
    Building,
} from '@/Domain/Entity';
import {
    ConstructionType,
    ConstructionInformationSummary,
    AssetAndUnitSummary,
} from '@/Domain/ValueObject';
import {
    CostItemResponse,
    AssetClassResponse,
    CostItemTagResponse,
    AssetChecklistResponse,
    AssetStatementResponse,
    RetirementResponse,
    RetirementCostItemResponse,
    RetirementCostItemFactory,
    RetirementFactory,
} from '@/Domain/Factory';
import { DocumentNumber } from '@/Domain/ValueObject/DocumentNumber';

export function dummyAssetClass(assetClassId: number): AssetClass {
    return new AssetClass(
        assetClassId,
        '鉄有固-運送施設 建物-鉄骨鉄筋コンクリート造又は鉄筋コンクリート造-停車場建物',
        '鉄コン造',
        10000,
        30,
        '建築仕上げ',
        '007停車場建物',
        '05建物',
        new Date(),
        new Date(),
    );
}

export function dummyCostItem({
    constructionType = '金属工事',
    price = 1000,
    assetClassId = null,
    name = 'テスト明細',
    constructionTime = '1A',
    transportationTime = '1A',
    id = 1,
    amount = 39.7,
    unitPrice = 34_200,
    code = 309,
    dimension = '300×600　一晩施工',
    unit = '㎡',
    remarks = 'メモ',
}: {
    constructionType?: ConstructionType;
    price?: number;
    assetClassId?: number | null;
    name?: string;
    constructionTime?: string;
    transportationTime?: string;
    id?: number | null;
    amount?: number;
    unitPrice?: number;
    code?: number | null;
    dimension?: string;
    unit?: string;
    remarks?: string;
}): CostItem {
    const tags = new CostItemTag(
        1,
        1,
        'コスモスクエア駅',
        new Date(),
        new Date(),
    );
    const checklist = new AssetChecklist(1, 1, new Date(), new Date());
    return new CostItem(
        id,
        1,
        name,
        constructionType,
        code,
        dimension,
        amount,
        unit,
        unitPrice,
        price,
        constructionTime,
        transportationTime,
        '代価',
        assetClassId ? dummyAssetClass(assetClassId) : null,
        [tags],
        [checklist],
        remarks,
        [],
        null,
        amount,
        price,
        '建物',
        new Date(),
        new Date(),
    );
}
export function dummyCostItems(): CostItem[] {
    return [
        {
            constructionType: '直接仮設工事',
            price: 10000,
            assetClassId: null,
        },
        {
            constructionType: '部分撤去工事',
            price: 10000,
            assetClassId: null,
        },
        {
            constructionType: 'タイル工事',
            price: 20000,
            assetClassId: 1,
        },
        {
            constructionType: '左官工事',
            price: 30000,
            assetClassId: 1,
        },
        {
            constructionType: 'ユニット及びその他の工事',
            price: 30000,
            assetClassId: 2,
        },
        { constructionType: '共通仮設費', price: 10000, assetClassId: null },
    ].map(e =>
        dummyCostItem({
            constructionType: e.constructionType as ConstructionType,
            price: e.price,
            assetClassId: e.assetClassId,
        }),
    );
}

export function dummyRetirementResponse(): RetirementResponse {
    return {
        id: 1,
        construction_statement_id: 1,
        retirement_cost_items: [dummyRetirementCostItemResponse()],
        retiremented_at: new Date('2020-01-01').toISOString(),
        construction_id: 1,
        csv_ikkatu_upload_info: {
            path: '/hoge',
            filename: 'xxx.xslx',
        },
        created_at: new Date('2020-01-01').toISOString(),
        updated_at: new Date('2020-10-10').toISOString(),
    };
}

export function dummyRetirement(): Retirement {
    return RetirementFactory.createFromResponseObject(
        dummyRetirementResponse(),
    );
}

export function dummyRetirementCostItemResponse(): RetirementCostItemResponse {
    return {
        id: 1,
        amount: 30,
        price: 200000,
        cost_item: dummyCostItemResponse(),
        asset_statement: dummyAssetStatementResponse(),
        retirement_id: 1,
        created_at: new Date('2020-01-01').toISOString(),
        updated_at: new Date('2020-10-10').toISOString(),
    };
}

export function dummyRetirementCostItem(): RetirementCostItem {
    return RetirementCostItemFactory.createFromResponseObject(
        dummyRetirementCostItemResponse(),
    );
}

export function dummyConstructionStatement(
    id: number,
    classification: Classification,
): ConstructionStatement {
    return new ConstructionStatement(
        id,
        1,
        '東梅田駅-テスト工事',
        '',
        new Date(),
        dummyCostItems(),
        classification,
        false,
        false,
        dummyRetirement(),
        new Date(),
        false,
        null,
        null,
        null,
        [],
        new Date(),
        new Date(),
    );
}

export function dummyAssetClassResponse(): AssetClassResponse {
    return {
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
}

export function dummyCostItemTagsResponse(): CostItemTagResponse[] {
    return [
        {
            id: 1,
            'cost_item_id': 1,
            name: 'コスモスクエア駅',
            'created_at': new Date('2020-01-01').toISOString(),
            'updated_at': new Date('2020-01-01').toISOString(),
        },
    ];
}

export function dummyAssetChecklistsResponse(): AssetChecklistResponse[] {
    return [
        {
            id: 1,
            user_id: 1,
            'created_at': new Date('2020-01-01').toISOString(),
            'updated_at': new Date('2020-01-02').toISOString(),
        },
    ];
}

export function dummyCostItemResponse(): CostItemResponse {
    return {
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
        'asset_class': dummyAssetClassResponse(),
        'cost_item_tags': dummyCostItemTagsResponse(),
        'asset_checklists': dummyAssetChecklistsResponse(),
        memo: 'メモ',
        photos_info: [{ path: 'xxx', filename: 'xxx.png' }],
        merged_cost_item_id: null,
        estimate_price: null,
        estimate_amount: null,
        asset_class_info: '建物',
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-02').toISOString(),
    };
}

export function dummyAssetStatementResponse(): AssetStatementResponse {
    return {
        id: 1,
        'construction_statement_id': 1,
        'asset_class': {
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
        },
        name: '東梅田駅（R2）建物',
        'distributed_price': 10000,
        'sap_key': '1000000001',
        'sap_recorded_at': new Date('2020-02-01').toISOString(),
        'sap_recorded_price': 12000,
        'is_privatized': true,
        'sap_fixed_asset_id': 1,
        construction_type_serial_number: 100,
        distributed_design_cost: 500,
        assessment_price: 0,
        'created_at': new Date('2020-01-01').toISOString(),
        'updated_at': new Date('2020-01-01').toISOString(),
        'buildings_id': dummyBuilding().id,
    };
}

export function dummyAssetStatement(isPrivivatized = true): AssetStatement {
    return new AssetStatement(
        1,
        1,
        dummyAssetClass(1),
        '東梅田駅（R2）建物',
        10000,
        '1000000001',
        new Date('2020-02-01'),
        12000,
        isPrivivatized,
        1,
        100,
        0,
        0,
        new Date('2020-01-01'),
        new Date('2020-01-01'),
        dummyBuilding().id,
    );
}

export function dummyDeflator(): Deflator {
    return new Deflator(
        1,
        2000,
        80,
        new Date('2020-09-09'),
        new Date('2020-10-10'),
    );
}

export function dummyConstructionInformationSummary(): ConstructionInformationSummary {
    return {
        constructionTypeSerialNumber: 100,
        assetName: '墨上',
        assetText: '2020年度東梅田駅可動式ホーム柵設置工事',
        assetClassName: '資産',
        sapWbsCode: '64185012-BK170091-K2HH1',
        sapBusinessCode: '102B0',
        businessCodeName: '工事原価勘定',
    };
}

export function dummyAssetAndUnitSummary(): AssetAndUnitSummary {
    return {
        sapWbsCode: '64185012-BK170091-K2HH1',
        assetName: '墨上',
        assetText: '2020年度東梅田駅可動式ホーム柵設置工事',
        assetClassName: '資産',
        businessCodeName: '工事原価勘定',
        sapRecordedAt: new Date('2020-10-10'),
    };
}

export function dummyContract(isPrivatized = true): Contract {
    return new Contract({
        memo: isPrivatized ? 'privatized' : '【共通】民営化前契約',
        expectedPrice: 9000,
        expectedPriceWithTax: 10000,
        contractedPrice: 5000,
    });
}

export function dummyConstruction(): Construction {
    return new Construction(
        1,
        'test工事',
        new DocumentNumber('22221111'),
        [dummyContract(), dummyContract(), dummyContract()],
        new Date(),
        new Date(),
        false,
        MigrationStatus.Open,
    );
}

export function dummyBuilding(): Building {
    return new Building(
        1,
        'R1',
        'M11',
        '駅建物',
        '江坂駅',
        '吹田市豊津町100番1',
        new Date(),
        'S',
        1808.32,
        7905.59,
        1655.63,
        new Date(),
        new Date(),
    );
}
