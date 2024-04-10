import { CostItem, AssetStatement } from '@/Domain/Entity';

const matchAssetStatements = <
    TCostItem extends Pick<CostItem, 'assetClass' | 'costItemTags'>,
    TAssetStatement extends Pick<AssetStatement, 'assetClass' | 'name'>,
>(
    costItem: TCostItem,
    assetStatements: TAssetStatement[],
): TAssetStatement[] => {
    // 最初に資産クラスコードだけで検索
    const matchedAssetStatements = assetStatements.filter(
        as => as.assetClass?.code === costItem.assetClass?.code,
    );

    // 資産クラスコードが同じ資産が複数一致しているかつ特定情報が存在する場合は、資産名称の一部に特定情報のいずれかが含まれているものを検索
    return matchedAssetStatements.length > 1 && costItem.costItemTags.length > 0
        ? matchedAssetStatements.filter(
              as =>
                  as.assetClass?.code === costItem.assetClass?.code &&
                  costItem.costItemTags
                      .filter(tag => tag)
                      .some(tag => as.name?.includes(tag.name)),
          )
        : matchedAssetStatements;
};

export default matchAssetStatements;
