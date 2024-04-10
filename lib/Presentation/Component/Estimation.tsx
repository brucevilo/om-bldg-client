import {
    AssetClass,
    AssetStatement,
    Building,
    Classification,
    Construction,
    ConstructionStatement,
    Project,
} from '@/Domain/Entity';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { head, isNil, uniq } from 'lodash';
import { AssetClassService, EstimationStatement } from '@/Domain/Service';
import { ConstructionStatementSheet } from './ConstructionStatementSheet';
import {
    AssetStatementForStore,
    ConstructionStatementForStore,
} from '@/Domain/Repository';
import { HoverErrorPopup } from '@/Presentation/Component/HoverErrorPopup';
import ConstructionStatementTabContent from './Estimation/ConstructionStatementTabContent';
import {
    ConstructionStatementEntryKey,
    ConstructionStatementFormValue,
    AssetStatementFormValue,
    ConstructionStatementEntry,
    EstimationResult,
} from './Estimation/types';
import CostItemTabContent from './Estimation/CostItemTabContent';
import AssetStatementTabContent from './Estimation/AssetStatementTabContent';
import buildConstructionStatementEntries from './Estimation/buildConstructionStatementEntries';

export type EstimationProps = {
    previousAssetStatements: AssetStatement[];
    previousConstructionStatements: ConstructionStatement[];
    construction: Construction;
    estimates: EstimationStatement[];
    assetClasses: AssetClass[];
    projects: Partial<Project>[];
    isDesignChange: boolean;
    onChange: (params: EstimationResult | undefined) => void;
    setEstimationErrors: (errors: string[]) => void;
    isFirstDesignChange: boolean;
    lines: string[];
    buildings: Building[];
    buildingTypes: string[];
};

export const Estimation: FC<EstimationProps> = ({
    previousAssetStatements,
    previousConstructionStatements,
    construction,
    estimates,
    assetClasses,
    projects,
    isDesignChange,
    onChange,
    setEstimationErrors,
    isFirstDesignChange,
    lines,
    buildings,
    buildingTypes,
}) => {
    const [
        previousConstructionStatementToEstimationStatementMap,
        setPreviousConstructionStatementToEstimationStatementMap,
    ] = useState<Map<ConstructionStatement, EstimationStatement>>(new Map());

    const [
        constructionStatementFormValueMap,
        setConstructionStatementFormValueMap,
    ] = useState<
        Map<ConstructionStatementEntryKey, ConstructionStatementFormValue>
    >(new Map());

    const [assetStatementFormValuesMap, setAssetStatementFormValuesMap] =
        useState<
            Map<ConstructionStatementEntryKey, Array<AssetStatementFormValue>>
        >(new Map());

    const costAssetClass = useMemo(
        () => AssetClassService.getCostAssetClass(assetClasses),
        [assetClasses],
    );

    useEffect(() => {
        if (previousConstructionStatements) {
            setPreviousConstructionStatementToEstimationStatementMap(
                new Map(
                    previousConstructionStatements
                        .map(key => ({
                            key,
                            value: estimates.find(p => p.name === key.name),
                        }))
                        .filter(({ value }) => !isNil(value))
                        .map(({ key, value }) => [
                            key,
                            value as EstimationStatement,
                        ]),
                ),
            );
        }
    }, [previousConstructionStatements, estimates]);

    useEffect(() => {
        setConstructionStatementFormValueMap(
            new Map([
                ...(previousConstructionStatements?.map(
                    (
                        cs,
                    ): [
                        ConstructionStatementEntryKey,
                        ConstructionStatementFormValue,
                    ] => [
                        cs,
                        {
                            projectCode: cs.projectCode,
                            classification: cs.classification,
                        },
                    ],
                ) || []),
                ...estimates.map(
                    (
                        e,
                    ): [
                        ConstructionStatementEntryKey,
                        ConstructionStatementFormValue,
                    ] => [
                        e,
                        {
                            projectCode:
                                projects.length === 1
                                    ? head(projects)?.code
                                    : undefined,

                            classification: Classification.Asset,
                        },
                    ],
                ),
            ]),
        );
    }, [previousConstructionStatements, estimates]);

    useEffect(() => {
        if (previousConstructionStatements && previousAssetStatements) {
            setAssetStatementFormValuesMap(
                new Map(
                    previousConstructionStatements.map(cs => [
                        cs,
                        previousAssetStatements
                            .filter(a => a.constructionStatementId === cs.id)
                            .filter(
                                a =>
                                    !isNil(a.assessmentPrice) &&
                                    a.assessmentPrice > 0,
                            )
                            .map(
                                ({
                                    name,
                                    assetClass,
                                    assessmentPrice,
                                    buildingsId,
                                }): AssetStatementFormValue => {
                                    return {
                                        name,
                                        assetClassCode:
                                            assetClass?.code ??
                                            costAssetClass.code ??
                                            undefined,
                                        // 附帯工事の場合は契約価格を初期値とする
                                        distributedPrice: cs.isCollateral
                                            ? assessmentPrice ?? undefined
                                            : undefined,
                                        buildingList: buildings,
                                        buildingTypeList: buildingTypes,
                                        buildingsId: buildingsId
                                            ? buildingsId
                                            : undefined,
                                    };
                                },
                            ),
                    ]),
                ),
            );
        }
    }, [
        previousConstructionStatements,
        previousAssetStatements,
        costAssetClass?.code,
    ]);

    const constructionStatementEntries =
        useMemo((): ConstructionStatementEntry[] => {
            return buildConstructionStatementEntries({
                assetClasses,
                assetStatementFormValuesMap,
                setAssetStatementFormValuesMap,
                construction,
                constructionStatementFormValueMap,
                setConstructionStatementFormValueMap,
                costAssetClass,
                estimates,
                previousAssetStatements,
                previousConstructionStatementToEstimationStatementMap,
                previousConstructionStatements,
                isFirstDesignChange,
                setPreviousConstructionStatementToEstimationStatementMap,
            });
        }, [
            assetClasses,
            assetStatementFormValuesMap,
            construction,
            constructionStatementFormValueMap,
            costAssetClass.code,
            estimates,
            previousAssetStatements,
            previousConstructionStatementToEstimationStatementMap,
            previousConstructionStatements,
        ]);

    const assetStatementErrors = useMemo(
        (): string[] =>
            uniq(
                constructionStatementEntries
                    .flatMap(cse =>
                        cse.assetStatementEntries.flatMap(ase => ase.errors),
                    )
                    .concat(
                        constructionStatementEntries.flatMap(
                            cse => cse.assetStatementEntries,
                        ).length === 0
                            ? ['資産が一つもありません']
                            : [],
                    ),
            ),
        [constructionStatementEntries],
    );
    const constructionStatementErrors = useMemo(
        (): string[] =>
            uniq(constructionStatementEntries.flatMap(cse => cse.errors)),
        [constructionStatementEntries],
    );
    const costItemErrors = useMemo(
        (): string[] =>
            uniq(
                constructionStatementEntries.flatMap(cse =>
                    cse.costItemEntries.flatMap(cie => cie.errors),
                ),
            ),
        [constructionStatementEntries],
    );

    useEffect(() => {
        if (onChange) {
            onChange(
                constructionStatementEntries.every(
                    e =>
                        !isNil(e.constructionStatementForStore) &&
                        !isNil(e.assetStatementsForStore),
                )
                    ? {
                          constructionStatements: constructionStatementEntries
                              .map(
                                  ({ constructionStatementForStore }) =>
                                      constructionStatementForStore,
                              )
                              .filter(
                                  (e): e is ConstructionStatementForStore =>
                                      !isNil(e),
                              ),
                          assetStatements: constructionStatementEntries
                              .flatMap(
                                  ({ assetStatementsForStore }) =>
                                      assetStatementsForStore,
                              )
                              .filter(
                                  (e): e is AssetStatementForStore =>
                                      !isNil(e) && e.distributedPrice > 0,
                              ),
                      }
                    : undefined,
            );
        }
    }, [onChange, constructionStatementEntries]);

    useEffect(() => {
        setEstimationErrors(
            assetStatementErrors
                .concat(constructionStatementErrors)
                .concat(costItemErrors),
        );
    }, [assetStatementErrors, constructionStatementErrors, costItemErrors]);

    return (
        <>
            <Tabs defaultActiveKey='constructionStatement'>
                <Tab
                    eventKey='constructionStatement'
                    title={
                        <>
                            工事明細
                            {constructionStatementErrors.length > 0 && (
                                <HoverErrorPopup
                                    content={constructionStatementErrors.join(
                                        '\n',
                                    )}
                                />
                            )}
                        </>
                    }
                    className='bg-white'
                >
                    <div className='overflow-auto'>
                        <ConstructionStatementTabContent
                            isDesignChange={isDesignChange}
                            construction={construction}
                            previousConstructionStatements={
                                previousConstructionStatements
                            }
                            previousConstructionStatementToEstimationStatementMap={
                                previousConstructionStatementToEstimationStatementMap
                            }
                            constructionStatementEntries={
                                constructionStatementEntries
                            }
                            projects={projects}
                        />
                    </div>
                </Tab>
                <Tab
                    eventKey='costItem'
                    title={
                        <>
                            明細項目
                            {costItemErrors.length > 0 && (
                                <HoverErrorPopup
                                    content={costItemErrors.join('\n')}
                                />
                            )}
                        </>
                    }
                    className='bg-white'
                >
                    <div className='overflow-auto'>
                        <CostItemTabContent
                            constructionStatementEntries={
                                constructionStatementEntries
                            }
                            construction={construction}
                            costAssetClass={costAssetClass}
                            buildings={buildings}
                            buildingTypes={buildingTypes}
                            assetStatementFormValuesMap={
                                assetStatementFormValuesMap
                            }
                            setAssetStatementFormValuesMap={
                                setAssetStatementFormValuesMap
                            }
                        />
                    </div>
                </Tab>
                <Tab
                    eventKey='assetStatement'
                    title={
                        <>
                            資産
                            {assetStatementErrors.length > 0 && (
                                <HoverErrorPopup
                                    content={assetStatementErrors.join('\n')}
                                />
                            )}
                        </>
                    }
                    className='bg-white'
                >
                    <div className='overflow-auto'>
                        <AssetStatementTabContent
                            constructionStatementEntries={
                                constructionStatementEntries
                            }
                            assetClasses={assetClasses}
                            costAssetClass={costAssetClass}
                            buildings={buildings}
                            buildingTypes={buildingTypes}
                            lines={lines}
                        />
                    </div>
                </Tab>
                <Tab
                    title='明細項目 (プレビュー)'
                    eventKey='constructionStatements'
                    className='bg-white'
                >
                    <div className='overflow-auto'>
                        {constructionStatementEntries
                            .map(
                                ({
                                    constructionStatementForStore:
                                        constructionStatementForStore,
                                }) => constructionStatementForStore,
                            )
                            .filter(
                                (
                                    constructionStatementForStore,
                                ): constructionStatementForStore is ConstructionStatementForStore =>
                                    !isNil(constructionStatementForStore),
                            )
                            .map((constructionStatementForStore, index) => (
                                <ConstructionStatementSheet
                                    key={index}
                                    sheet={constructionStatementForStore}
                                />
                            ))}
                    </div>
                </Tab>
            </Tabs>
        </>
    );
};
