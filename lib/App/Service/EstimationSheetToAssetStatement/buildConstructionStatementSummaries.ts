import {
    AssetClass,
    ConstructionStatement,
    AssetStatement,
    Classification,
} from '@/Domain/Entity';
import { AssetInfo, ConstructionStatementSummary } from '@/Domain/ValueObject';
import { assertsIsExists } from '@/Infrastructure';

export const buildConstructionStatementSummaries = (
    summaries: ConstructionStatementSummary[],
    constructionStatements: ConstructionStatement[],
    assetClasses: AssetClass[],
    prevConstructionStatements: ConstructionStatement[] | null,
    prevAssetStatements: AssetStatement[] | null,
): ConstructionStatementSummary[] => {
    return constructionStatements.map(statement => {
        const prevStatement = prevConstructionStatements?.find(
            cs => cs.name === statement.name,
        );
        const newSummary = summaries.find(s => s.name === statement.name);
        const prevSummary = prevConstructionStatementSummary(
            prevStatement,
            prevAssetStatements,
            assetClasses,
        );
        if (newSummary && prevSummary)
            return mergeSummary(prevSummary, newSummary);
        if (newSummary) return newSummary;
        if (prevSummary) return prevSummary;
        throw new Error('対応する概要が存在しません');
    });
};

const prevConstructionStatementSummary = (
    prevConstructionStatement: ConstructionStatement | null | undefined,
    prevAssetStatements: AssetStatement[] | null,
    assetClasses: AssetClass[],
): ConstructionStatementSummary | null => {
    if (!prevConstructionStatement || !prevAssetStatements) return null;
    const assetInfos: AssetInfo[] = prevAssetStatements
        .filter(
            as =>
                as.constructionStatementId === prevConstructionStatement.id &&
                !as.isCost,
        )
        .map(as => {
            const assetClass = assetClasses.find(
                ac => ac.id === as.assetClass?.id,
            );
            assertsIsExists(assetClass?.code);
            return {
                name: as.name,
                code: assetClass.code,
                price:
                    prevConstructionStatement.isCollateral &&
                    as.assessmentPrice !== null
                        ? as.assessmentPrice
                        : undefined,
            };
        });

    const cost = prevConstructionStatement.isCollateral
        ? prevAssetStatements.find(
              as =>
                  as.constructionStatementId === prevConstructionStatement.id &&
                  as.isCost,
          )?.assessmentPrice ?? undefined
        : undefined;

    return {
        isCollateral: prevConstructionStatement.isCollateral,
        cost,
        name: prevConstructionStatement.name,
        classification:
            prevConstructionStatement.classification === Classification.Asset
                ? '資産'
                : '費用',
        assetInfos,
    };
};

const mergeSummary = (
    currentSummary: ConstructionStatementSummary,
    newSummary: ConstructionStatementSummary,
): ConstructionStatementSummary => {
    // 新規に追加されたAssetInfoがあれば追加
    const newAssetInfos = [
        ...currentSummary.assetInfos.map(currentAssetInfo => ({
            ...currentAssetInfo,
            price: newSummary.assetInfos.find(
                newAssetInfo => newAssetInfo.name === currentAssetInfo.name,
            )?.price,
        })),
        ...newSummary.assetInfos.filter(
            newAssetInfo =>
                !currentSummary.assetInfos.some(
                    currentAssetInfo =>
                        currentAssetInfo.name === newAssetInfo.name,
                ),
        ),
    ];
    return {
        isCollateral: currentSummary.isCollateral,
        cost: newSummary.cost,
        name: currentSummary.name,
        classification: currentSummary.classification,
        assetInfos: newAssetInfos,
    };
};
