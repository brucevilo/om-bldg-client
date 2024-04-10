import React, { FC, useState } from 'react';
import { Button, Modal, Tab, Table, Tabs } from 'react-bootstrap';
import { AssetClassDivision } from '../apps/entities/AssetClassDivision';
import { ConstructionStatement } from '../apps/entities/ConstructionStatement';
import { SapRecord } from '../apps/SapDocument';
import { SapRecordTable } from './SapRecordTable';

type Props = {
    value: ConstructionStatement;
    editable: boolean;
    sapRecords: SapRecord[];
    erroredSapKeys: string[];
    onChange(item: ConstructionStatement): void;
};

export const AssetClassDivisionTable: FC<Props> = ({
    value,
    editable,
    sapRecords,
    erroredSapKeys,
    onChange,
}) => {
    const [selectedAssetType, setSelectedAssetType] = useState<string>('');

    return (
        <Table>
            <thead>
                <tr>
                    <th>資産区分</th>
                    <th>金額</th>
                    <th>KEY</th>
                    <th>資産名称</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {value.assetClassDivisions.map(assetClassDivision => {
                    const record = sapRecords.find(
                        a => a.assetKey === assetClassDivision.assetKey,
                    );
                    return (
                        <tr
                            key={assetClassDivision.type}
                            className={
                                !assetClassDivision.isLinked() ||
                                erroredSapKeys.includes(
                                    assetClassDivision.assetKey,
                                )
                                    ? 'text-danger'
                                    : ''
                            }
                        >
                            <td>{assetClassDivision.type}</td>
                            <td>{assetClassDivision.price}</td>
                            <td>{assetClassDivision.assetKey}</td>
                            <td>
                                {!assetClassDivision.isLinked()
                                    ? AssetClassDivision.KEY_UNKNOWN
                                    : assetClassDivision.isExpense()
                                    ? AssetClassDivision.TYPE_EXPENSE
                                    : record?.assetName}
                            </td>
                            <td>
                                <Button
                                    hidden={!editable}
                                    size='sm'
                                    onClick={() => {
                                        setSelectedAssetType(
                                            assetClassDivision.type,
                                        );
                                    }}
                                >
                                    照合
                                </Button>
                                <Modal
                                    show={
                                        selectedAssetType ===
                                        assetClassDivision.type
                                    }
                                    size='xl'
                                    onHide={() => setSelectedAssetType('')}
                                >
                                    <Modal.Header closeButton>
                                        <Modal.Title>{value.name}</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Table>
                                            <thead>
                                                <tr>
                                                    <th>資産区分</th>
                                                    <th>金額</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        {
                                                            assetClassDivision.type
                                                        }
                                                    </td>
                                                    <td>
                                                        {
                                                            assetClassDivision.price
                                                        }
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                        <Tabs>
                                            <Tab
                                                title='候補'
                                                eventKey='candidate'
                                            >
                                                <SapRecordTable
                                                    assets={sapRecords.filter(
                                                        record => {
                                                            return assetClassDivision.isCandidate(
                                                                record,
                                                            );
                                                        },
                                                    )}
                                                    errored={erroredSapKeys}
                                                    type='button'
                                                    onSelect={record => {
                                                        onChange(
                                                            value.updateAssetClassDivision(
                                                                assetClassDivision.setAssetKey(
                                                                    record.assetKey,
                                                                ),
                                                            ),
                                                        );
                                                        setSelectedAssetType(
                                                            '',
                                                        );
                                                    }}
                                                    selected={[
                                                        assetClassDivision.assetKey,
                                                    ]}
                                                ></SapRecordTable>
                                            </Tab>
                                            <Tab title='全一覧' eventKey='list'>
                                                <SapRecordTable
                                                    assets={sapRecords}
                                                    errored={erroredSapKeys}
                                                    type='button'
                                                    onSelect={record => {
                                                        onChange(
                                                            value.updateAssetClassDivision(
                                                                assetClassDivision.setAssetKey(
                                                                    record.assetKey,
                                                                ),
                                                            ),
                                                        );
                                                        setSelectedAssetType(
                                                            '',
                                                        );
                                                    }}
                                                    selected={[
                                                        assetClassDivision.assetKey,
                                                    ]}
                                                ></SapRecordTable>
                                            </Tab>
                                            <Tab title='その他' eventKey='etc'>
                                                <Button
                                                    className='m-3'
                                                    onClick={() => {
                                                        onChange(
                                                            value.updateAssetClassDivision(
                                                                assetClassDivision.setAssetKey(
                                                                    AssetClassDivision.KEY_EXPENSE,
                                                                ),
                                                            ),
                                                        );
                                                        setSelectedAssetType(
                                                            '',
                                                        );
                                                    }}
                                                >
                                                    費用計上する
                                                </Button>
                                            </Tab>
                                        </Tabs>
                                    </Modal.Body>
                                </Modal>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};
