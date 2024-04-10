import React, { FC } from 'react';
import { Button, Tab, Table, Tabs } from 'react-bootstrap';
import { ConstructionStatement } from '../apps/entities/ConstructionStatement';
import { DesignStatement } from '../apps/entities/DesignStatement';
import { SapRecord } from '../apps/SapDocument';
import { ConstructionStatementRow } from './ConstructionStatementRow';

type Props = {
    value: DesignStatement;
    merged: DesignStatement;
    prev: DesignStatement;
    sapRecords: SapRecord[];
    erroredSapKeys: string[];
    onChange(item: DesignStatement): void;
    onAssetClassDivisionChange(item: ConstructionStatement): void;
};

export const DesignStatementBlock: FC<Props> = ({
    value,
    merged,
    prev,
    sapRecords,
    erroredSapKeys,
    onChange,
    onAssetClassDivisionChange,
}) => {
    return (
        <div>
            <div className='d-flex justify-content-between m-3'>
                <div className='d-flex align-items-center'>
                    <div className='mr-3'>設計図</div>
                    {value.designDocument ? (
                        <div>
                            <Button
                                variant='link'
                                onClick={() => {
                                    if (!value.designDocument) {
                                        throw Error('設計図がありません');
                                    }
                                    const url = URL.createObjectURL(
                                        value.designDocument,
                                    );
                                    window.open(url, 'preview');
                                    URL.revokeObjectURL(url);
                                }}
                            >
                                {value.designDocument.name}
                            </Button>
                            <Button
                                className='mr-2'
                                onClick={() => {
                                    onChange(value.setDesignDocument(null));
                                }}
                            >
                                削除
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={e => e.preventDefault()}>
                            <input
                                required
                                type='file'
                                onChange={e => {
                                    if (!e.target.files || !e.target.files[0]) {
                                        return;
                                    }
                                    onChange(
                                        value.setDesignDocument(
                                            e.target.files[0],
                                        ),
                                    );
                                }}
                            />
                        </form>
                    )}
                </div>
            </div>
            <div className='d-flex justify-content-between m-3'>
                <div className='d-flex align-items-center'>
                    <div className='mr-3'>工事費内訳書</div>
                    <Button
                        variant='link'
                        onClick={() => {
                            const url = URL.createObjectURL(value.costDocument);
                            window.open(url, 'preview');
                            URL.revokeObjectURL(url);
                        }}
                    >
                        {value.costDocument.name}
                    </Button>
                </div>
            </div>
            <Tabs>
                <Tab
                    title='差分情報'
                    eventKey='designChange'
                    tabClassName={value.hasError() ? 'text-danger' : ''}
                >
                    <Table>
                        <tbody>
                            {value.constructionStatements.map(cs => {
                                const pcs = prev.constructionStatements.find(
                                    pcs => pcs.uniqueName === cs.uniqueName,
                                );
                                return (
                                    <ConstructionStatementRow
                                        key={cs.name + cs.designChangeNumber}
                                        value={cs}
                                        prev={pcs ? pcs : cs}
                                        editable={true}
                                        sapRecords={sapRecords}
                                        erroredSapKeys={erroredSapKeys}
                                        nameList={prev.constructionStatements
                                            .filter(
                                                fcs =>
                                                    fcs.parentName !==
                                                    ConstructionStatement.NAME_UNKNOWN,
                                            )
                                            .map(cs => cs.uniqueName)}
                                        onChange={item => {
                                            onChange(
                                                value.updateConstructionStatement(
                                                    item,
                                                ),
                                            );
                                        }}
                                        onAssetClassDivisionChange={
                                            onAssetClassDivisionChange
                                        }
                                    ></ConstructionStatementRow>
                                );
                            })}
                        </tbody>
                    </Table>
                </Tab>
                <Tab
                    title='適用後'
                    eventKey='merged'
                    tabClassName={
                        merged.hasError() || merged.hasInvalidCostItem()
                            ? 'text-danger'
                            : ''
                    }
                >
                    <Table>
                        <tbody>
                            {merged.constructionStatements.map(cs => {
                                return (
                                    <ConstructionStatementRow
                                        key={cs.name + cs.designChangeNumber}
                                        value={cs}
                                        prev={cs}
                                        editable={false}
                                        isMerged={true}
                                        sapRecords={sapRecords}
                                        erroredSapKeys={erroredSapKeys}
                                        nameList={[]}
                                        onChange={item => item.name}
                                        onAssetClassDivisionChange={
                                            onAssetClassDivisionChange
                                        }
                                    ></ConstructionStatementRow>
                                );
                            })}
                        </tbody>
                    </Table>
                </Tab>
            </Tabs>
        </div>
    );
};
