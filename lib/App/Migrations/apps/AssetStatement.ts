import {
    AssetClass,
    AssetStatement,
    ConstructionStatement,
} from '@/Domain/Entity';
import { assertsIsExists } from '@/Infrastructure';
import { DesignStatement } from './entities/DesignStatement';
import { SapRecordMap } from './SapDocument';

function distributeCommonExpense(
    targetPrice: number,
    constructionStatement: ConstructionStatement,
): number {
    // 直接工事費
    const 直接工事費 = constructionStatement.costItems
        .filter(ci => ci.isDirectExpence)
        .reduce((total, current) => total + current.price, 0);
    // 直接仮設工事費
    const 直接仮設工事費 = constructionStatement.costItems
        .filter(ci => ci.constructionType === '直接仮設工事')
        .reduce((total, current) => total + current.price, 0);
    // 共通費
    const 共通費 = constructionStatement.costItems
        .filter(ci => ci.isCommonExpence)
        .reduce((total, current) => total + current.price, 0);
    return (
        Math.round(
            (targetPrice +
                (targetPrice / (直接工事費 - 直接仮設工事費)) * 直接仮設工事費 +
                (targetPrice / (直接工事費 - 直接仮設工事費)) * 共通費) /
                1000,
        ) * 1000
    );
}

export function createAssetStatements(
    designStatement: DesignStatement,
    constructionStatements: ConstructionStatement[],
    assetClasses: AssetClass[],
    sapRecordMap: SapRecordMap,
): AssetStatement[] {
    const assets = designStatement.constructionStatements.flatMap(mcs => {
        const constructionStatement = constructionStatements.find(
            cs => cs.name === mcs.uniqueName,
        );
        assertsIsExists(
            constructionStatement,
            '対応するConstructionStatementが存在しません',
        );
        return mcs.assetClassDivisions
            .filter(acd => !acd.isExpense() && acd.isLinked())
            .map(acd => {
                const sapRecord = sapRecordMap[acd.assetKey];
                assertsIsExists(sapRecord, '対応するSapRecordが存在しません');
                const assetClass = assetClasses.find(
                    ac => ac.code === Number(sapRecord.assetClassCode),
                );
                const distributedPrice = distributeCommonExpense(
                    acd.price,
                    constructionStatement,
                );
                return new AssetStatement(
                    null,
                    constructionStatement.id as number,
                    assetClass ? assetClass : null,
                    sapRecord.assetName,
                    distributedPrice,
                    sapRecord.assetKey,
                    sapRecord.acquisitionDate,
                    sapRecord.acquisirionPrice,
                    true,
                    null,
                    null,
                    0,
                    0,
                    new Date(),
                    new Date(),
                    null,
                );
            });
    });
    const cost = designStatement.constructionStatements.flatMap(mcs => {
        const constructionStatement = constructionStatements.find(
            cs => cs.name === mcs.uniqueName,
        );
        assertsIsExists(
            constructionStatement,
            '対応するConstructionStatementが存在しません',
        );
        const price = mcs.assetClassDivisions
            .filter(acd => acd.isExpense())
            .reduce((price, acd) => price + acd.price, 0);
        const distributedPrice = distributeCommonExpense(
            price,
            constructionStatement,
        );
        return new AssetStatement(
            null,
            constructionStatement.id as number,
            assetClasses.find(acs => acs.code === 0) || null,
            '費用計上',
            distributedPrice,
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
            null,
        );
    });
    return [...assets, ...cost];
}
