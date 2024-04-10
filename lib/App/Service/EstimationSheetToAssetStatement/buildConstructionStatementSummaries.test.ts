import {
    AssetClass,
    AssetStatement,
    Classification,
    ConstructionStatement,
} from '@/Domain/Entity';
import { ConstructionStatementSummary } from '@/Domain/ValueObject';
import { buildConstructionStatementSummaries } from './buildConstructionStatementSummaries';
import { dummyRetirement } from '@/__test__/dummy';

test('既存のConstructionStatementに紐づくSummaryがない場合は既存のConstructionStatementだけでSummaryに変換される', () => {
    const assetClasses: AssetClass[] = [
        new AssetClass(
            11,
            'asset',
            '',
            100,
            null,
            '',
            '',
            '',
            new Date(),
            new Date(),
        ),
    ];
    const currentAssetStatements: AssetStatement[] = [
        new AssetStatement(
            null,
            1,
            assetClasses[0],
            'asset1',
            0,
            '',
            null,
            null,
            true,
            null,
            null,
            0,
            0,
            new Date(),
            new Date(),
            1,
        ),
    ];
    const currentConstructionStatements: ConstructionStatement[] = [
        new ConstructionStatement(
            1,
            1,
            '東梅田駅-test1工事',
            '1',
            new Date(),
            [],
            Classification.Asset,
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
        ),
    ];
    const newSummaries = buildConstructionStatementSummaries(
        [],
        currentConstructionStatements,
        assetClasses,
        currentConstructionStatements,
        currentAssetStatements,
    );
    const expected: ConstructionStatementSummary[] = [
        {
            isCollateral: false,
            name: '東梅田駅-test1工事',
            classification: '資産',
            assetInfos: [{ name: 'asset1', code: 100 }],
        },
    ];
    expect(newSummaries).toHaveLength(1);
    expect(newSummaries[0].name).toBe(expected[0].name);
    expect(newSummaries[0].classification).toBe(expected[0].classification);
    expect(newSummaries[0].assetInfos).toHaveLength(1);
    expect(newSummaries[0].assetInfos[0].name).toBe(
        expected[0].assetInfos[0].name,
    );
    expect(newSummaries[0].assetInfos[0].code).toBe(
        expected[0].assetInfos[0].code,
    );
});

test(`
    重複するConstructionStatementやAssetClassがあった場合、
    重複の無いようにデータが合成される
`, () => {
    const assetClasses: AssetClass[] = [
        new AssetClass(
            11,
            'asset class 1',
            '',
            100,
            null,
            '',
            '',
            '',
            new Date(),
            new Date(),
        ),
        new AssetClass(
            12,
            'asset class 2',
            '',
            101,
            null,
            '',
            '',
            '',
            new Date(),
            new Date(),
        ),
    ];
    const currentAssetStatements: AssetStatement[] = [
        new AssetStatement(
            null,
            1, // assetClassCode 100
            assetClasses[0],
            'asset1',
            0,
            '',
            null,
            null,
            true,
            null,
            null,
            0,
            0,
            new Date(),
            new Date(),
            1,
        ),
    ];
    const currentConstructionStatements: ConstructionStatement[] = [
        new ConstructionStatement(
            1,
            1,
            '東梅田-test1',
            '1',
            new Date(),
            [],
            Classification.Asset,
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
        ),
    ];
    const currentSummaries: ConstructionStatementSummary[] = [
        {
            isCollateral: false,
            name: '東梅田-test1',
            classification: '資産',
            assetInfos: [{ name: 'asset2', code: 101 }],
        },
    ];
    const newSummaries = buildConstructionStatementSummaries(
        currentSummaries,
        currentConstructionStatements,
        assetClasses,
        currentConstructionStatements,
        currentAssetStatements,
    );
    const expected: ConstructionStatementSummary[] = [
        {
            isCollateral: false,
            name: '東梅田-test1',
            classification: '資産',
            assetInfos: [
                { name: 'asset1', code: 100 },
                { name: 'asset2', code: 101 },
            ],
        },
    ];
    expect(newSummaries).toHaveLength(1);
    expect(newSummaries[0].name).toBe(expected[0].name);
    expect(newSummaries[0].classification).toBe(expected[0].classification);
    expect(newSummaries[0].assetInfos).toHaveLength(2);
    const asset1 = newSummaries[0].assetInfos.find(ai => ai.name === 'asset1');
    expect(asset1?.name).toBe(expected[0].assetInfos[0].name);
    expect(asset1?.code).toBe(expected[0].assetInfos[0].code);
    const asset2 = newSummaries[0].assetInfos.find(ai => ai.name === 'asset2');
    expect(asset2?.name).toBe(expected[0].assetInfos[1].name);
    expect(asset2?.code).toBe(expected[0].assetInfos[1].code);
});
