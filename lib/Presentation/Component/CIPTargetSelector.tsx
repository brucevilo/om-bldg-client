import { AssetStatement } from '@/Domain/Entity';
import { assertsIsNotNull } from '@/Infrastructure';
import { xor } from 'lodash';
import React, { FC, useContext } from 'react';
import { Table } from 'react-bootstrap';
import { CIPContext } from '../Context';

const AssetStatementRow = ({
    assetStatement,
}: {
    assetStatement: AssetStatement;
}) => {
    return (
        <tr>
            <td>{assetStatement.name}</td>
            <td>
                {(
                    (assetStatement.assessmentPrice as number) +
                    assetStatement.distributedDesignCost
                ).toLocaleString()}
            </td>
            <td>{assetStatement.assetClass?.code}</td>
            <td>{assetStatement.assetClass?.name}</td>
        </tr>
    );
};

export const CIPTargetSelector: FC = () => {
    const context = useContext(CIPContext);
    assertsIsNotNull(context);
    const {
        constructionStatements,
        assetStatements,
        selectedConstructionStatementIds,
        onChangeSelectedConstructionStatementIds,
    } = context;
    const tables = constructionStatements.map(cs => {
        const targetAssetStatements = assetStatements.filter(
            as => as.constructionStatementId === cs.id,
        );
        const rows = targetAssetStatements.map(as => (
            <AssetStatementRow key={as.id} assetStatement={as} />
        ));
        return (
            <div key={cs.id}>
                {cs.isConstructionInProgressCompleted === false ? (
                    <>
                        <div className='d-flex align-items-center mb-3'>
                            <input
                                type='checkbox'
                                className='mr-1'
                                id={`cip-target-${cs.id}`}
                                disabled={cs.isConstructionInProgressCompleted}
                                checked={selectedConstructionStatementIds.includes(
                                    cs.id as number,
                                )}
                                onChange={() =>
                                    onChangeSelectedConstructionStatementIds(
                                        xor(selectedConstructionStatementIds, [
                                            cs.id as number,
                                        ]),
                                    )
                                }
                            />
                            <label
                                className='mb-0'
                                htmlFor={`cip-target-${cs.id}`}
                            >
                                {cs.name}
                            </label>
                        </div>
                        <Table>
                            <thead>
                                <tr>
                                    <th>資産名称</th>
                                    <th style={{ width: '200px' }}>
                                        契約時金額
                                    </th>
                                    <th style={{ width: '200px' }}>
                                        資産クラスコード
                                    </th>
                                    <th>資産クラス</th>
                                </tr>
                            </thead>
                            <tbody>{rows}</tbody>
                        </Table>
                    </>
                ) : (
                    ''
                )}
            </div>
        );
    });
    return <div>{tables}</div>;
};
