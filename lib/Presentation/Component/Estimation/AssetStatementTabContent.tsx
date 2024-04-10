import { AssetClass, Building, Classification } from '@/Domain/Entity';
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sum, isNil, uniq } from 'lodash';
import React, { FC, Fragment } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { DefferedFormControl } from '../DefferedFormControl';
import { DefferedNumberInput } from '../DefferedNumberInput';
import { HoverErrorPopup } from '../HoverErrorPopup';
import { ConstructionStatementEntry } from './types';

export type AssetStatementTabContentProps = {
    constructionStatementEntries: ConstructionStatementEntry[];
    assetClasses: AssetClass[];
    costAssetClass: AssetClass;
    buildings: Building[];
    buildingTypes: string[];
    lines: string[];
};

const AssetStatementTabContent: FC<AssetStatementTabContentProps> = ({
    constructionStatementEntries,
    assetClasses,
    costAssetClass,
    buildings,
    buildingTypes,
    lines,
}) => {
    const totalDistributedPrice = sum(
        constructionStatementEntries.flatMap(
            ({ assetStatementEntries: assetStatements }) =>
                assetStatements.map(
                    ({ actualDistributedPrice: distributedPrice }) =>
                        distributedPrice,
                ),
        ),
    );

    return (
        <Table>
            <thead>
                <tr>
                    <th>工事</th>
                    <th />
                    <th>資産クラス</th>
                    <th>資産名</th>
                    <th>建物</th>
                    <th>
                        金額
                        {`(合計 ${totalDistributedPrice.toLocaleString()})`}
                    </th>
                </tr>
            </thead>
            <tbody>
                {constructionStatementEntries
                    .map(
                        ({
                            name: constructionStatementName,
                            assetStatementEntries,
                            isCollateral,
                            onClickAddAssetStatement,
                            formValue,
                        }) => ({
                            assetStatementEntries,
                            constructionStatementName,
                            formValue,
                            cellsArray: [
                                ...(assetStatementEntries || []).map(
                                    ({
                                        formValue: {
                                            assetClassCode,
                                            name,
                                            line,
                                            buildingType,
                                            buildingTypeList,
                                            buildingsId,
                                            buildingList,
                                        },
                                        actualDistributedPrice,
                                        changeValue,
                                        onClickDelete,
                                        errors,
                                    }) => {
                                        const isCostConstructionStatement =
                                            formValue.classification ===
                                            Classification.Cost;
                                        return (
                                            <>
                                                <td className='text-right'>
                                                    <Button
                                                        onClick={onClickDelete}
                                                        disabled={
                                                            isCostConstructionStatement
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    </Button>
                                                </td>
                                                <td>
                                                    {errors.length > 0 && (
                                                        <HoverErrorPopup
                                                            content={errors.join(
                                                                '\n',
                                                            )}
                                                        />
                                                    )}
                                                    <Form.Group>
                                                        <Form.Control
                                                            as='select'
                                                            value={
                                                                assetClassCode ??
                                                                ''
                                                            }
                                                            isInvalid={isNil(
                                                                assetClassCode,
                                                            )}
                                                            onChange={e =>
                                                                changeValue &&
                                                                changeValue(
                                                                    'assetClassCode',
                                                                    e.target
                                                                        .value
                                                                        ? Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : undefined,
                                                                )
                                                            }
                                                            disabled={
                                                                isCostConstructionStatement
                                                            }
                                                        >
                                                            <option value=''>
                                                                選択してください
                                                            </option>
                                                            {assetClasses?.map(
                                                                (
                                                                    {
                                                                        code,
                                                                        name,
                                                                    },
                                                                    index,
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            code ??
                                                                            ''
                                                                        }
                                                                    >
                                                                        {`${code} : ${name}`}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Form.Group>
                                                        <DefferedFormControl
                                                            placeholder='資産名を入力してください'
                                                            disabled={
                                                                assetClassCode ===
                                                                costAssetClass.code
                                                            }
                                                            isInvalid={!name}
                                                            value={name}
                                                            onChange={e =>
                                                                changeValue &&
                                                                changeValue(
                                                                    'name',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Form.Group>
                                                        <Form.Control
                                                            as='select'
                                                            value={line}
                                                            onChange={e => {
                                                                if (
                                                                    changeValue
                                                                ) {
                                                                    changeValue(
                                                                        'line',
                                                                        e.target
                                                                            .value
                                                                            ? e
                                                                                  .target
                                                                                  .value
                                                                            : undefined,
                                                                    );
                                                                    buildingTypeList =
                                                                        buildings
                                                                            .filter(
                                                                                building =>
                                                                                    building.line ==
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                            )
                                                                            .map(
                                                                                b =>
                                                                                    b.buildingType,
                                                                            );
                                                                    changeValue(
                                                                        'buildingTypeList',
                                                                        buildingTypeList.length ===
                                                                            0
                                                                            ? buildingTypes
                                                                            : uniq(
                                                                                  buildingTypeList,
                                                                              ),
                                                                    );
                                                                    changeValue(
                                                                        'buildingType',
                                                                        undefined,
                                                                    );
                                                                    changeValue(
                                                                        'buildingsId',
                                                                        undefined,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <option
                                                                value=''
                                                                disabled
                                                                selected
                                                            >
                                                                号線を選択
                                                            </option>
                                                            {lines.map(
                                                                (
                                                                    line,
                                                                    index,
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            line
                                                                        }
                                                                    >
                                                                        {line}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </Form.Control>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Control
                                                            as='select'
                                                            value={buildingType}
                                                            disabled={
                                                                line ===
                                                                undefined
                                                            }
                                                            onChange={e => {
                                                                if (
                                                                    changeValue
                                                                ) {
                                                                    changeValue(
                                                                        'buildingType',
                                                                        e.target
                                                                            .value
                                                                            ? e
                                                                                  .target
                                                                                  .value
                                                                            : undefined,
                                                                    );
                                                                    changeValue(
                                                                        'buildingsId',
                                                                        undefined,
                                                                    );
                                                                    buildingList =
                                                                        buildings.filter(
                                                                            building =>
                                                                                building.line ==
                                                                                    line &&
                                                                                building.buildingType ==
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                        );
                                                                    changeValue(
                                                                        'buildingList',
                                                                        buildingList,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <option
                                                                value=''
                                                                disabled
                                                                selected
                                                            >
                                                                建物種別を選択
                                                            </option>
                                                            {buildingTypeList?.map(
                                                                (
                                                                    type,
                                                                    index,
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            type
                                                                        }
                                                                    >
                                                                        {type}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </Form.Control>
                                                    </Form.Group>
                                                    <Form.Group>
                                                        <Form.Control
                                                            as='select'
                                                            value={
                                                                buildingsId ??
                                                                ''
                                                            }
                                                            disabled={
                                                                buildingType ===
                                                                undefined
                                                            }
                                                            onChange={e =>
                                                                changeValue &&
                                                                changeValue(
                                                                    'buildingsId',
                                                                    e.target
                                                                        .value
                                                                        ? Number(
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                          )
                                                                        : undefined,
                                                                )
                                                            }
                                                        >
                                                            <option
                                                                value=''
                                                                disabled
                                                            >
                                                                建物を選択
                                                            </option>
                                                            {buildingList?.map(
                                                                (
                                                                    building,
                                                                    index,
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            building.id
                                                                        }
                                                                    >
                                                                        {
                                                                            building.facilityName
                                                                        }
                                                                    </option>
                                                                ),
                                                            )}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </td>
                                                <td>
                                                    <Form.Group>
                                                        <DefferedNumberInput
                                                            value={
                                                                actualDistributedPrice?.toLocaleString() ||
                                                                ''
                                                            }
                                                            disabled={
                                                                !isCollateral ||
                                                                (isCollateral &&
                                                                    assetClassCode ===
                                                                        costAssetClass.code)
                                                            }
                                                            onChange={value => {
                                                                changeValue &&
                                                                    changeValue(
                                                                        'distributedPrice',
                                                                        Number(
                                                                            value,
                                                                        ),
                                                                    );
                                                            }}
                                                        />
                                                    </Form.Group>
                                                </td>
                                            </>
                                        );
                                    },
                                ),
                                <td
                                    key='add-button-cell'
                                    className='text-right'
                                >
                                    <Button
                                        onClick={() =>
                                            onClickAddAssetStatement()
                                        }
                                        disabled={
                                            formValue.classification ===
                                            Classification.Cost
                                        }
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </Button>
                                </td>,
                            ],
                        }),
                    )
                    .map(
                        ({
                            constructionStatementName,
                            cellsArray,
                            formValue,
                        }) => {
                            const isCostConstruction =
                                formValue.classification ===
                                Classification.Cost;
                            const [headCells, ...otherCells] = cellsArray;
                            return (
                                <Fragment key={constructionStatementName}>
                                    <tr
                                        className={
                                            isCostConstruction ? 'bg-light' : ''
                                        }
                                    >
                                        <td rowSpan={cellsArray.length}>
                                            {constructionStatementName}
                                        </td>
                                        {headCells}
                                    </tr>
                                    {otherCells.map((cell, cellsIndex) => (
                                        <tr
                                            className={
                                                isCostConstruction
                                                    ? 'bg-light'
                                                    : ''
                                            }
                                            key={cellsIndex}
                                        >
                                            {cell}
                                        </tr>
                                    ))}
                                </Fragment>
                            );
                        },
                    )}
            </tbody>
        </Table>
    );
};

export default AssetStatementTabContent;
