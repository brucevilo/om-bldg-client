import { assertsIsExists } from '@/Infrastructure';
import {
    AssetStatement,
    ConstructionStatement,
    Design,
    DesignContractType,
} from '../Entity';

/**
 * 設計委託費按分
 * ConstructionStatementの金額で按分した金額を、
 * ConstructionStatementに属するAssetStatementの金額で按分する
 */
export class DistributeDesignCostService {
    constructor(
        private constructionStatements: ConstructionStatement[],
        private assetStatements: AssetStatement[],
        private designs: Design[],
    ) {}

    public invoke(): AssetStatement[] {
        const totalDesignCost = this.designs
            .filter(
                design => design.contractType === DesignContractType.External,
            )
            .reduce((total, design) => {
                return total + (design.latestContract.contractedPrice || 0);
            }, 0);
        const distributedCostByConstructionStatement =
            this.distributeCostByConstructionStatement(totalDesignCost);
        const result = this.assetStatements.map(as => {
            const designCostForConstructionStatement =
                distributedCostByConstructionStatement.find(
                    cs =>
                        cs.constructionStatementId ===
                        as.constructionStatementId,
                );
            assertsIsExists(designCostForConstructionStatement);
            const distributedCost =
                Math.round(
                    (designCostForConstructionStatement.distributedCost *
                        (as.distributedPrice /
                            designCostForConstructionStatement.constructionStatementPrice)) /
                        1000,
                ) * 1000;
            const distributedAssetStatement = as.copy();
            distributedAssetStatement.distributedDesignCost = distributedCost;
            return distributedAssetStatement;
        });
        return result;
    }

    private distributeCostByConstructionStatement(totalDesignCost: number) {
        const totalConstructionPrice = this.assetStatements.reduce(
            (total, as) => total + as.distributedPrice,
            0,
        );
        const distributedCostByConstructionStatement =
            this.constructionStatements.map(cs => {
                const constructionStatementPrice = this.assetStatements
                    .filter(as => as.constructionStatementId === cs.id)
                    .reduce((total, as) => total + as.distributedPrice, 0);
                return {
                    constructionStatementId: cs.id as number,
                    constructionStatementPrice,
                    distributedCost:
                        totalDesignCost *
                        (constructionStatementPrice / totalConstructionPrice),
                };
            });
        return distributedCostByConstructionStatement;
    }
}
