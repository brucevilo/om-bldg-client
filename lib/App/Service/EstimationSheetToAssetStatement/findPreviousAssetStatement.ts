import { AssetStatement, ConstructionStatement } from '@/Domain/Entity';

export const findPreviousAssetStatement = (
    name: string,
    currentConstructionStatement: ConstructionStatement,
    prevConstructionStatements: ConstructionStatement[] | null,
    prevAssetStatements: AssetStatement[] | null,
): AssetStatement | null => {
    const prevConstructionStatement = prevConstructionStatements?.find(
        pcs => pcs.name === currentConstructionStatement.name,
    );
    if (!prevConstructionStatement) return null;

    const prevAssetStatement = prevAssetStatements?.find(
        pas =>
            pas.constructionStatementId === prevConstructionStatement.id &&
            pas.name === name,
    );
    return prevAssetStatement || null;
};
