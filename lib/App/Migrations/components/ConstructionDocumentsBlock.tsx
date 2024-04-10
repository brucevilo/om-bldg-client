import React, { FC, useEffect, useState } from 'react';
import { Form, Tab, Table, Tabs } from 'react-bootstrap';
import { ConstructionDocuments } from '../apps/entities/ConstructionDocuments';
import { MigrationConstruction } from '../apps/entities/MigrationConstruction';
import { SapRecordMap } from '../apps/SapDocument';
import { DesignStatementBlock } from './DesignStatementBlock';
import { SapRecordTable } from './SapRecordTable';

type Props = {
    value: ConstructionDocuments;
    constructions: MigrationConstruction[];
    sapRecordMap: SapRecordMap;
    onChange(item: ConstructionDocuments): void;
};

export const ConstructionDocumentsBlock: FC<Props> = ({
    value,
    constructions,
    sapRecordMap,
    onChange,
}) => {
    const [year, setYear] = useState<number>(value.migrationConstruction.year);
    const [erroredSapKeys, setErroredSapKeys] = useState<string[]>([]);

    const onSelectYear = (year: number) => {
        if (constructions.length === 0) {
            return;
        }
        let mc = constructions.find(c => c.year === year);
        if (mc === undefined) {
            mc = constructions[0];
        }
        if (value.migrationConstruction.year !== mc.year) {
            onChange(value.setMigrationConstruction(mc));
        }
        setYear(mc.year);
    };

    useEffect(() => {
        const selected = value.lastMergedDesignStatement
            ? value.lastMergedDesignStatement.constructionStatements.flatMap(
                  c => c.assetClassDivisions.map(a => a.assetKey),
              )
            : [];
        setErroredSapKeys(
            value.migrationConstruction.recordKeys.filter(
                v => !selected.includes(v),
            ),
        );
    }, [value]);

    useEffect(() => {
        onSelectYear(value.migrationConstruction.year);
    }, [constructions]);

    return (
        <div>
            {constructions.length === 0 ? (
                <div className='text-danger'>
                    工事一覧に該当工事が見つかりませんでした。
                </div>
            ) : null}
            <h3>
                {value.migrationConstruction.year}年度{' '}
                {value.migrationConstruction.name}
            </h3>
            <div
                hidden={erroredSapKeys.length === 0 && value.isMerged()}
                className='text-danger'
            >
                未特定項目が存在します
            </div>
            <Tabs>
                <Tab title='SAP固定資産台帳' eventKey='sap'>
                    <Form.Control
                        as='select'
                        value={year}
                        onChange={e => onSelectYear(Number(e.target.value))}
                    >
                        {constructions.map(c => (
                            <option key={c.year} value={c.year}>
                                {c.year}年度 {c.name}
                            </option>
                        ))}
                    </Form.Control>
                    <SapRecordTable
                        assets={value.migrationConstruction.recordKeys.map(
                            key => sapRecordMap[key],
                        )}
                        errored={erroredSapKeys}
                    ></SapRecordTable>
                </Tab>
                <Tab title='資産管理明細書' eventKey='assetManagementSheet'>
                    {value.lastMergedDesignStatement
                        ? value.lastMergedDesignStatement.constructionStatements.map(
                              constructionStatement => (
                                  <div
                                      className='m-3'
                                      key={constructionStatement.name}
                                  >
                                      <h5>{constructionStatement.name}</h5>
                                      <Table>
                                          <thead>
                                              <tr>
                                                  <th>項目名称</th>
                                                  <th>資産名称</th>
                                                  <th>資産クラスコード</th>
                                                  <th>金額</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              {constructionStatement.assetItemsMaster.map(
                                                  asset => (
                                                      <tr
                                                          key={
                                                              asset.sheetName +
                                                              asset.typeName +
                                                              asset.assetName +
                                                              asset.price
                                                          }
                                                      >
                                                          <td>
                                                              {asset.typeName}
                                                          </td>
                                                          <td>
                                                              {asset.assetName}
                                                          </td>
                                                          <td>
                                                              {
                                                                  asset.assetClassCode
                                                              }
                                                          </td>
                                                          <td>{asset.price}</td>
                                                      </tr>
                                                  ),
                                              )}
                                          </tbody>
                                      </Table>
                                  </div>
                              ),
                          )
                        : null}
                </Tab>
                {Object.keys(value.mergedDesignStatementMap).map(key => {
                    const designChangeNumber = Number(key);
                    const ds = value.designStatementMap[designChangeNumber];
                    const mds =
                        value.mergedDesignStatementMap[designChangeNumber];
                    const pds =
                        designChangeNumber === 0
                            ? mds
                            : value.mergedDesignStatementMap[
                                  designChangeNumber - 1
                              ]
                            ? value.mergedDesignStatementMap[
                                  designChangeNumber - 1
                              ]
                            : mds;
                    return (
                        <Tab
                            title={
                                designChangeNumber === 0
                                    ? '元設計'
                                    : `第${designChangeNumber}回設計変更`
                            }
                            eventKey={`designChange_${designChangeNumber}`}
                            key={designChangeNumber}
                            tabClassName={
                                ds.hasError() ||
                                ds.constructionStatements
                                    .flatMap(cs =>
                                        cs.assetClassDivisions.map(
                                            acd => acd.assetKey,
                                        ),
                                    )
                                    .some(key =>
                                        erroredSapKeys.includes(key),
                                    ) ||
                                mds.hasInvalidCostItem()
                                    ? 'text-danger'
                                    : ''
                            }
                        >
                            <DesignStatementBlock
                                value={ds}
                                merged={mds}
                                prev={pds}
                                sapRecords={value.migrationConstruction.recordKeys.map(
                                    sapKey => sapRecordMap[sapKey],
                                )}
                                erroredSapKeys={erroredSapKeys}
                                onChange={item =>
                                    onChange(value.updateDesignStatement(item))
                                }
                                onAssetClassDivisionChange={item => {
                                    let newValue = value;
                                    Object.values(
                                        value.designStatementMap,
                                    ).forEach(ds => {
                                        const target =
                                            ds.constructionStatements.find(
                                                cs =>
                                                    cs.uniqueName ===
                                                    item.uniqueName,
                                            );
                                        if (!target) {
                                            return;
                                        }
                                        newValue =
                                            newValue.updateDesignStatement(
                                                ds.updateConstructionStatement(
                                                    target.updateAssetClassDivisions(
                                                        item,
                                                    ),
                                                ),
                                            );
                                    });
                                    onChange(newValue);
                                }}
                            ></DesignStatementBlock>
                        </Tab>
                    );
                })}
            </Tabs>
        </div>
    );
};
