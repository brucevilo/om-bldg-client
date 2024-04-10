import {
    AssetStatement,
    Classification,
    ConstructionStatement,
} from '@/Domain/Entity';
import { findPreviousAssetStatement } from './findPreviousAssetStatement';

test('前回設計時の工事種別連番を引き継ぐために、前回設計のAssetStatementを探す', () => {
    const currentConstructionStatement = new ConstructionStatement(
        1,
        1,
        '東梅田駅-工事1',
        '1',
        new Date(),
        [],
        Classification.Asset,
        false,
        false,
        null,
        new Date(),
        false,
        null,
        null,
        null,
        [],
        new Date(),
        new Date(),
    );
    const previousConstructionStatements = [
        new ConstructionStatement(
            2,
            1,
            '東梅田駅-工事1',
            '1',
            new Date(),
            [],
            Classification.Asset,
            false,
            false,
            null,
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
    const previousAssetStatements = [
        new AssetStatement(
            1,
            2,
            null,
            '資産1',
            0,
            '',
            null,
            null,
            false,
            null,
            100,
            0,
            0,
            new Date(),
            new Date(),
            1,
        ),
    ];
    const previousAssetStatement = findPreviousAssetStatement(
        '資産1',
        currentConstructionStatement,
        previousConstructionStatements,
        previousAssetStatements,
    );
    expect(previousAssetStatement?.constructionTypeSerialNumber).toBe(100);
});

test('資産名称が違う場合は前の資産と判定されない', () => {
    const currentConstructionStatement = new ConstructionStatement(
        1,
        1,
        '東梅田駅-工事1',
        '1',
        new Date(),
        [],
        Classification.Asset,
        false,
        false,
        null,
        new Date(),
        false,
        null,
        null,
        null,
        [],
        new Date(),
        new Date(),
    );
    const previousConstructionStatements = [
        new ConstructionStatement(
            2,
            1,
            '東梅田駅-工事1',
            '1',
            new Date(),
            [],
            Classification.Asset,
            false,
            false,
            null,
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
    const previousAssetStatements = [
        new AssetStatement(
            1,
            2,
            null,
            '資産1',
            0,
            '',
            null,
            null,
            false,
            null,
            100,
            0,
            0,
            new Date(),
            new Date(),
            1,
        ),
    ];
    const previousAssetStatement = findPreviousAssetStatement(
        '資産2',
        currentConstructionStatement,
        previousConstructionStatements,
        previousAssetStatements,
    );
    expect(previousAssetStatement).toBeNull();
});
