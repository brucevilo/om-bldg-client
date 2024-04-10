import React, { Dispatch, FC, useState } from 'react';
import classnames from 'classnames';
import {
    AssetStatementFormValue,
    ConstructionStatementEntry,
    ConstructionStatementEntryKey,
} from './types';
import { HoverErrorPopup } from '../HoverErrorPopup';
import { isNil, uniqBy } from 'lodash';
import { Table, Form, ButtonGroup, Button } from 'react-bootstrap';
import { AssetClass, Building, Construction } from '@/Domain/Entity';
import { COST_ASSET_STATEMENT_NAME } from './constants';

export type CostItemTabContentProps = {
    constructionStatementEntries: ConstructionStatementEntry[];
    construction: Construction;
    costAssetClass: AssetClass;
    buildings: Building[];
    buildingTypes: string[];
    assetStatementFormValuesMap: Map<
        ConstructionStatementEntryKey,
        AssetStatementFormValue[]
    >;
    setAssetStatementFormValuesMap: Dispatch<
        React.SetStateAction<
            Map<ConstructionStatementEntryKey, AssetStatementFormValue[]>
        >
    >;
};

const CostItemTabContent: FC<CostItemTabContentProps> = ({
    constructionStatementEntries,
    construction,
    costAssetClass,
    buildings,
    buildingTypes,
    assetStatementFormValuesMap,
    setAssetStatementFormValuesMap,
}) => {
    const [showHasErrorsOnly, setShowHasErrorsOnly] = useState(true);
    const rows = constructionStatementEntries.flatMap(
        (e, constructionStatementIndex) =>
            e.costItemEntries
                ?.filter(
                    ({ errors }) => !showHasErrorsOnly || errors.length > 0,
                )
                .map(
                    (
                        { previous, merged, matchedAssetStatements, errors },
                        costItemEntryIndex,
                    ) => (
                        <tr
                            key={`${constructionStatementIndex}-${costItemEntryIndex}`}
                            className={classnames({
                                'bg-warning': errors.length > 0,
                            })}
                        >
                            <td>{e.name}</td>
                            <td>
                                {errors.length > 0 && (
                                    <HoverErrorPopup
                                        content={errors.join('\n')}
                                    />
                                )}
                                {merged.name}
                                {false &&
                                    merged.costItemTags
                                        .map(({ name }) => name)
                                        .join(',')}
                            </td>
                            <td>{merged.constructionType}</td>
                            <td>{merged.code}</td>
                            <td>{merged.dimension}</td>
                            <td className='text-right'>
                                {merged.amount.toLocaleString()}
                                {`${
                                    merged.estimateAmount
                                        ? ` (${merged.estimateAmount.toLocaleString(
                                              undefined,
                                              {
                                                  signDisplay: 'always',
                                              },
                                          )})`
                                        : ''
                                }`}
                            </td>
                            <td>{merged.unit}</td>
                            <td className='text-right'>
                                {merged.unitPrice.toLocaleString()}
                            </td>
                            <td className='text-right'>
                                <div
                                    title={JSON.stringify(
                                        {
                                            beforePrice: !isNil(previous)
                                                ? previous.price.toLocaleString()
                                                : '-',
                                            estimatePrice: merged.estimatePrice
                                                ? merged.estimatePrice.toLocaleString()
                                                : '-',
                                            expectedMergedPrice:
                                                !isNil(previous) &&
                                                !isNil(merged.estimatePrice)
                                                    ? (
                                                          Math.floor(
                                                              Math.floor(
                                                                  previous.price *
                                                                      construction
                                                                          .latestContract
                                                                          .rate,
                                                              ) / 1000,
                                                          ) *
                                                              1000 +
                                                          merged.estimatePrice
                                                      ).toLocaleString()
                                                    : '-',
                                        },
                                        null,
                                        2,
                                    )}
                                >
                                    {Math.floor(merged.price).toLocaleString()}
                                </div>
                            </td>
                            <td>
                                {merged.constructionTime}/
                                {merged.transportationTime}
                            </td>
                            <td>{merged.remarks}</td>
                            <td>
                                {merged.assetClassInfo
                                    ? merged.assetClassInfo
                                    : '---'}
                            </td>
                            <td>
                                {merged.costItemTags
                                    .map(({ name }) => name)
                                    .join(',')}
                            </td>
                            <td title={merged.assetClass?.name}>
                                {merged.assetClass?.code === 0
                                    ? '費用'
                                    : merged.assetClass?.code}
                            </td>
                            <td>
                                {matchedAssetStatements.map(
                                    (
                                        { assetClassCode, name },
                                        assetStatementIndex,
                                    ) => (
                                        <div key={assetStatementIndex}>
                                            {assetClassCode} :{' '}
                                            {name || '名称未設定'}
                                        </div>
                                    ),
                                )}
                            </td>
                        </tr>
                    ),
                ),
    );

    const CostItemTable = () => (
        <Table>
            <thead>
                <tr>
                    <th>工事明細名</th>
                    <th>明細項目名</th>
                    <th>工種</th>
                    <th>単価コード</th>
                    <th>形状寸法</th>
                    <th>数量</th>
                    <th>単位</th>
                    <th>単価</th>
                    <th>金額</th>
                    <th>作業/運搬時間</th>
                    <th>摘要</th>
                    <th>資産区分</th>
                    <th>特定情報</th>
                    <th>資産クラス</th>
                    <th>資産</th>
                </tr>
            </thead>
            <tbody>{rows}</tbody>
        </Table>
    );

    const createAssetStatementFormValue = (
        value: Partial<AssetStatementFormValue>,
    ): AssetStatementFormValue => ({
        ...(value ? value : {}),
        ...(value?.assetClassCode === costAssetClass.code
            ? { name: COST_ASSET_STATEMENT_NAME }
            : {}),
        buildingList: buildings,
        buildingTypeList: buildingTypes,
    });

    const bulkAddAssetStatemenCandidates = constructionStatementEntries
        .map(
            ({
                formValueKey,
                costItemEntries,
            }): {
                formValueKey: ConstructionStatementEntryKey;
                assetStatementFormValues: AssetStatementFormValue[];
            } => ({
                formValueKey,
                assetStatementFormValues: uniqBy(
                    costItemEntries
                        .filter(
                            ci =>
                                ci.matchedAssetStatements.length === 0 &&
                                !isNil(ci.merged.assetClass),
                        )
                        .map(ci =>
                            createAssetStatementFormValue({
                                assetClassCode:
                                    ci.merged.assetClass?.code ?? undefined,
                            }),
                        ),
                    ({ assetClassCode }) => assetClassCode,
                ),
            }),
        )
        .filter(
            ({ assetStatementFormValues }) =>
                assetStatementFormValues.length > 0,
        );

    return (
        <>
            <div className='d-flex p-3 w-100'>
                <Form.Check
                    type='switch'
                    id='errors-only'
                    label='エラーがある明細項目のみ表示する'
                    checked={showHasErrorsOnly}
                    onChange={() => setShowHasErrorsOnly(!showHasErrorsOnly)}
                />
                <ButtonGroup className='ml-auto'>
                    <Button
                        disabled={bulkAddAssetStatemenCandidates.length === 0}
                        onClick={() => {
                            setAssetStatementFormValuesMap(
                                [
                                    ...Array.from(
                                        assetStatementFormValuesMap,
                                    ).map(([key, value]) => ({
                                        key,
                                        value,
                                    })),
                                    ...bulkAddAssetStatemenCandidates.map(
                                        ({
                                            formValueKey: key,
                                            assetStatementFormValues: value,
                                        }) => ({ key, value }),
                                    ),
                                ].reduce((acc, { key, value }) => {
                                    acc.has(key)
                                        ? acc.get(key)?.push(...value)
                                        : acc.set(key, value);
                                    return acc;
                                }, new Map<ConstructionStatementEntryKey, AssetStatementFormValue[]>()),
                            );
                        }}
                    >
                        資産一括追加
                    </Button>
                </ButtonGroup>
            </div>
            <CostItemTable />
        </>
    );
};

export default CostItemTabContent;
