import { getClient } from '@/Infrastructure';
import {
    ConstructionStatement,
    AssetClass,
    Classification,
    Construction,
} from '@/Domain/Entity';
import {
    ConstructionStatementResponse,
    ConstructionStatementFactory,
} from '@/Domain/Factory';
import { SapRecordMap } from '../SapDocument';
import { DesignStatement } from '../entities/DesignStatement';
import { readAsBase64 } from '../utils';

export class ConstructionStatementRepository {
    static async store(
        designStatement: DesignStatement,
        construction: Construction,
        assetClasses: AssetClass[],
        sapRecordMap: SapRecordMap,
    ): Promise<ConstructionStatement[]> {
        const params = designStatement.constructionStatements.map(cs => {
            const isAsset: boolean =
                cs.assetClassDivisions.filter(
                    acd => !acd.isExpense() && acd.isLinked(),
                ).length > 0;
            const costItemParams = cs.items.map(i => {
                // 資産クラスマスタと照合する
                const acd = cs.assetClassDivisions.find(
                    acd => acd.type === i.assetClassDivision,
                );
                const assetClass =
                    acd &&
                    assetClasses.find(ac => {
                        return (
                            ac.code ===
                            (sapRecordMap[acd.assetKey] !== undefined
                                ? Number(
                                      sapRecordMap[acd.assetKey].assetClassCode,
                                  )
                                : 0)
                        );
                    });
                return {
                    'construction_statement_id': null,
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
                    remarks: i.remarks1,
                    'asset_class_id': assetClass ? assetClass.id : null,
                    'cost_item_tags_attributes': [],
                };
            });
            return {
                'construction_id': construction.id,
                name: cs.name,
                term: construction.createdAt,
                classification: isAsset
                    ? Classification.Asset
                    : Classification.Cost,
                'cost_items_attributes': costItemParams,
            };
        });
        const res = await getClient().post<
            unknown,
            ConstructionStatementResponse[]
        >(
            `/migrations/constructions/${construction.id}/construction_statements`,
            {
                'construction_statements': params,
                'contract_index': designStatement.designChangeNumber,
                'spec_file_name': designStatement.designDocument
                    ? designStatement.designDocument.name
                    : null,
                'spec_file': designStatement.designDocument
                    ? await readAsBase64(designStatement.designDocument)
                    : null,
                'cost_document_name': designStatement.costDocument.name,
                'cost_document': await readAsBase64(
                    designStatement.costDocument,
                ),
            },
        );
        return res.data.map(ConstructionStatementFactory.createFromResponse);
    }
}
