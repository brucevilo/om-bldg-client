import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Tab, Tabs } from 'react-bootstrap';
import { ConstructionStatement } from '../apps/entities/ConstructionStatement';
import { CostItem } from '../apps/entities/CostItem';
import { CostItemTable } from './CostItemTable';
import { AssetClassDivisionTable } from './AssetClassDivisionTable';
import { SapRecord } from '../apps/SapDocument';

type Props = {
    value: ConstructionStatement;
    prev: ConstructionStatement;
    editable: boolean;
    isMerged?: boolean;
    sapRecords: SapRecord[];
    erroredSapKeys: string[];
    nameList: string[];
    onChange(cs: ConstructionStatement): void;
    onAssetClassDivisionChange(cs: ConstructionStatement): void;
};

export const ConstructionStatementRow: FC<Props> = ({
    value,
    prev,
    editable,
    isMerged,
    sapRecords,
    erroredSapKeys,
    nameList,
    onChange,
    onAssetClassDivisionChange,
}) => {
    const [name, setName] = useState<string>(
        ConstructionStatement.NAME_UNKNOWN,
    );
    const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
    const [costItem, setCostItem] = useState<CostItem>();

    useEffect(() => {
        setName(value.parentName);
    }, [value]);

    return (
        <tr>
            <td>
                <div className='d-flex justify-content-between'>
                    <Button
                        variant='link'
                        size='lg'
                        onClick={() => setIsDetailVisible(!isDetailVisible)}
                    >
                        <span
                            className={
                                value.hasError() ||
                                (isMerged && value.hasItemInvalid())
                                    ? 'text-danger'
                                    : ''
                            }
                        >
                            {value.name}
                        </span>
                    </Button>
                </div>
                <div hidden={!isDetailVisible} className='mt-3 pl-4'>
                    <div hidden={!editable}>
                        <div hidden={value.isLinked()} className='text-danger'>
                            工事明細が特定できませんでした。
                        </div>
                        <Form
                            className='mb-3'
                            onSubmit={e => e.preventDefault()}
                            hidden={value.designChangeNumber === 0}
                        >
                            <Form.Row>
                                <Form.Label column sm='1'>
                                    元設計
                                </Form.Label>
                                <Col sm='11'>
                                    <Form.Control
                                        as='select'
                                        onChange={e => {
                                            const name = e.target.value;
                                            setName(name);
                                            onChange(
                                                value
                                                    .setParentName(name)
                                                    .resetItemLink(),
                                            );
                                        }}
                                        value={name}
                                    >
                                        <option>
                                            {ConstructionStatement.NAME_UNKNOWN}
                                        </option>
                                        <option>
                                            {ConstructionStatement.NAME_NEW}
                                        </option>
                                        {nameList.map(name => (
                                            <option key={name}>{name}</option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            </Form.Row>
                        </Form>
                    </div>
                    <div hidden={value.isAssetLinked()} className='text-danger'>
                        資産名称に特定できなかったものがあります。
                    </div>
                    <AssetClassDivisionTable
                        value={value}
                        editable={editable}
                        sapRecords={sapRecords}
                        erroredSapKeys={erroredSapKeys}
                        onChange={onAssetClassDivisionChange}
                    ></AssetClassDivisionTable>
                    <div hidden={value.isItemLinked()} className='text-danger'>
                        明細項目に特定できなかったものがあります。
                    </div>
                    <div
                        hidden={!isMerged || !value.hasItemInvalid()}
                        className='text-danger'
                    >
                        明細項目に数量がマイナスのものがあります。
                    </div>
                    <CostItemTable
                        costItems={value.items}
                        editable={
                            editable &&
                            value.isLinked() &&
                            value.parentName !== ConstructionStatement.NAME_NEW
                        }
                        isMerged={!editable}
                        buttonName='照合'
                        onSelect={item => {
                            setCostItem(item);
                        }}
                    ></CostItemTable>

                    <Modal
                        show={costItem !== undefined}
                        size='xl'
                        onHide={() => {
                            setCostItem(undefined);
                        }}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>明細項目照合</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {costItem ? (
                                <div>
                                    <CostItemTable
                                        costItems={[costItem]}
                                        editable={true}
                                        selectedId={costItem.parentId}
                                        onSelect={item => {
                                            onChange(
                                                value.updateCostItem(
                                                    costItem.setParentId(
                                                        item.id,
                                                    ),
                                                ),
                                            );
                                            setCostItem(undefined);
                                        }}
                                    ></CostItemTable>
                                    <Tabs>
                                        <Tab title='候補' eventKey='candidate'>
                                            <CostItemTable
                                                costItems={prev.items.filter(
                                                    i =>
                                                        i.constructionType ===
                                                            costItem.constructionType &&
                                                        ((costItem.constructionType ===
                                                            '共通仮設費' &&
                                                            i.name ===
                                                                costItem.name) ||
                                                            Math.abs(
                                                                i.unitPrice,
                                                            ) ===
                                                                Math.abs(
                                                                    costItem.unitPrice,
                                                                )),
                                                )}
                                                selectedId={costItem.parentId}
                                                editable={true}
                                                onSelect={item => {
                                                    onChange(
                                                        value.updateCostItem(
                                                            costItem.setParentId(
                                                                item.id,
                                                            ),
                                                        ),
                                                    );
                                                    setCostItem(undefined);
                                                }}
                                            ></CostItemTable>
                                        </Tab>
                                        <Tab title='一覧' eventKey='list'>
                                            <CostItemTable
                                                costItems={prev.items.filter(
                                                    i =>
                                                        i.constructionType ===
                                                        costItem.constructionType,
                                                )}
                                                selectedId={costItem.parentId}
                                                editable={true}
                                                onSelect={item => {
                                                    onChange(
                                                        value.updateCostItem(
                                                            costItem.setParentId(
                                                                item.id,
                                                            ),
                                                        ),
                                                    );
                                                    setCostItem(undefined);
                                                }}
                                            ></CostItemTable>
                                        </Tab>
                                    </Tabs>
                                </div>
                            ) : null}
                        </Modal.Body>
                    </Modal>
                </div>
            </td>
        </tr>
    );
};
