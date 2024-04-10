import {
    AssetClass,
    AssetStatement,
    Classification,
    Construction,
    ConstructionStatement,
    CostItem,
} from '@/Domain/Entity';
import { AssetStatementForStore } from '@/Domain/Repository';
import {
    EstimationStatement,
    EstimationService,
    MergeCostItems,
} from '@/Domain/Service';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import { sumBy, cloneDeep, sum, head, isNil } from 'lodash';
import { ChangeEvent, Dispatch } from 'react';
import { COST_ASSET_STATEMENT_NAME } from './constants';
import matchAssetStatements from './matchAssetStatements';
import {
    ConstructionStatementEntry,
    BaseEntry,
    AssetStatementFormValue,
    BuildAssetStatementEntryParams,
    AssetStatementEntry,
    ConstructionStatementEntryKey,
    ConstructionStatementFormValue,
} from './types';

type buildConstructionStatementEntriesParams = {
    assetClasses: AssetClass[];
    assetStatementFormValuesMap: Map<
        ConstructionStatementEntryKey,
        AssetStatementFormValue[]
    >;
    setAssetStatementFormValuesMap: Dispatch<
        React.SetStateAction<
            Map<ConstructionStatementEntryKey, AssetStatementFormValue[]>
        >
    >;
    construction: Construction;
    constructionStatementFormValueMap: Map<
        ConstructionStatementEntryKey,
        ConstructionStatementFormValue
    >;
    setConstructionStatementFormValueMap: Dispatch<
        React.SetStateAction<
            Map<ConstructionStatementEntryKey, ConstructionStatementFormValue>
        >
    >;
    costAssetClass: AssetClass;
    estimates: EstimationStatement[];
    previousAssetStatements: AssetStatement[];
    previousConstructionStatements: ConstructionStatement[];
    previousConstructionStatementToEstimationStatementMap: Map<
        ConstructionStatement,
        EstimationStatement
    >;
    setPreviousConstructionStatementToEstimationStatementMap: Dispatch<
        React.SetStateAction<Map<ConstructionStatement, EstimationStatement>>
    >;
    isFirstDesignChange: boolean;
};

const buildConstructionStatementEntries = ({
    assetClasses,
    assetStatementFormValuesMap,
    setAssetStatementFormValuesMap,
    construction,
    constructionStatementFormValueMap,
    setConstructionStatementFormValueMap,
    costAssetClass,
    estimates,
    previousAssetStatements,
    previousConstructionStatements,
    previousConstructionStatementToEstimationStatementMap,
    setPreviousConstructionStatementToEstimationStatementMap,
    isFirstDesignChange,
}: buildConstructionStatementEntriesParams): ConstructionStatementEntry[] => {
    function buildBaseEntries(): BaseEntry[] {
        return [
            ...estimates.map(estimationStatement => ({
                previousConstructionStatement: Array.from(
                    previousConstructionStatementToEstimationStatementMap,
                )
                    .map(([key, value]) => ({ key, value }))
                    .find(({ value }) => value === estimationStatement)?.key,
                estimationStatement,
            })),
            ...previousConstructionStatements
                ?.filter(
                    cs =>
                        !Array.from(
                            previousConstructionStatementToEstimationStatementMap.keys(),
                        ).includes(cs),
                )
                .map(previousConstructionStatement => ({
                    previousConstructionStatement,
                    estimationStatement: undefined,
                })),
        ]
            .map(e => ({
                ...e,
                name:
                    e.estimationStatement?.name ??
                    e.previousConstructionStatement?.name,
                isCollateral:
                    e.estimationStatement?.isCollateral ??
                    e.previousConstructionStatement?.isCollateral,
                term:
                    e.estimationStatement?.term ??
                    e.previousConstructionStatement?.term,
                formValueKey:
                    e.estimationStatement || e.previousConstructionStatement,
            }))
            .map(e => ({
                ...e,
                formValue:
                    constructionStatementFormValueMap.get(e.formValueKey) || {},
            }))
            .map(e => ({
                ...e,
                errors: [],
                changeFormValue: (name, value) => {
                    if (
                        name === 'classification' &&
                        value === Classification.Cost &&
                        !!e.estimationStatement
                    ) {
                        const entries = Array.from(assetStatementFormValuesMap);
                        const newEntries = entries.filter(
                            ([k]) =>
                                k !== e.formValueKey &&
                                (!e.previousConstructionStatement ||
                                    k.name !==
                                        e.previousConstructionStatement.name),
                        );
                        const estimationPrice = sumBy(
                            e.estimationStatement?.estimationItems,
                            item => item.price,
                        );
                        const beforeAssessmentPrice = previousAssetStatements
                            .filter(
                                pAs =>
                                    pAs.constructionStatementId ===
                                    e.previousConstructionStatement?.id,
                            )
                            .reduce(
                                (total, as) =>
                                    total + (as.assessmentPrice || 0),
                                0,
                            );
                        newEntries.push([
                            e.formValueKey,
                            [
                                {
                                    name: COST_ASSET_STATEMENT_NAME,
                                    assetClassCode:
                                        costAssetClass.code ?? undefined,
                                    // 今回の金額 + 前回の契約時の工事明細の金額 で金額を合わせる
                                    distributedPrice:
                                        estimationPrice + beforeAssessmentPrice,
                                },
                            ],
                        ]);

                        setAssetStatementFormValuesMap(new Map(newEntries));
                    }
                    setConstructionStatementFormValueMap(
                        new Map([
                            ...Array.from(
                                constructionStatementFormValueMap.entries(),
                            ).filter(([key]) => key !== e.formValueKey),
                            [
                                e.formValueKey,
                                {
                                    ...constructionStatementFormValueMap.get(
                                        e.formValueKey,
                                    ),
                                    [name]: value,
                                },
                            ],
                        ]),
                    );
                },
                onClickAddAssetStatement: () => {
                    const entries = Array.from(assetStatementFormValuesMap);

                    entries
                        .filter(([k]) => k === e.formValueKey)
                        .forEach(([, v]) => v.push({}));

                    if (!assetStatementFormValuesMap.has(e.formValueKey)) {
                        entries.push([e.formValueKey, [{}]]);
                    }

                    setAssetStatementFormValuesMap(new Map(entries));
                },
                onChangePreviousConstructionStatement: (
                    event: ChangeEvent<HTMLInputElement>,
                ) => {
                    if (e.estimationStatement) {
                        setPreviousConstructionStatementToEstimationStatementMap(
                            new Map([
                                ...Array.from(
                                    previousConstructionStatementToEstimationStatementMap,
                                ).filter(
                                    ([key]) =>
                                        key !== e.previousConstructionStatement,
                                ),
                                ...previousConstructionStatements
                                    .map(
                                        (
                                            cs,
                                        ): [
                                            ConstructionStatement,
                                            EstimationStatement,
                                        ] => [cs, e.estimationStatement],
                                    )
                                    .filter(
                                        ([cs]) =>
                                            cs.name === event.target.value,
                                    ),
                            ]),
                        );
                    }
                },
            }));
    }

    function buildCostItemEntries({
        previousConstructionStatement,
        estimationStatement,
        formValueKey,
    }: BaseEntry) {
        const estimateCostItems = [
            ...(estimationStatement
                ? estimationStatement.estimationItems.map(estimationItem => ({
                      estimationItem,
                      costItem: EstimationService.estimationItemToCostItem(
                          estimationItem,
                          assetClasses,
                      ),
                  }))
                : []),
            // 附帯工事の場合は資産に対応する CostItem を生成
            ...(estimationStatement?.isCollateral
                ? (assetStatementFormValuesMap.get(formValueKey) || [])
                      .filter(
                          ({ assetClassCode }) =>
                              assetClassCode !== costAssetClass.code,
                      )
                      .map(
                          ({
                              name,
                              assetClassCode,
                              distributedPrice,
                          }: AssetStatementFormValue) => ({
                              estimationItem: undefined,
                              costItem: new CostItem(
                                  null,
                                  null,
                                  name ?? '',
                                  '直接工事',
                                  null,
                                  '',
                                  Math.floor((distributedPrice ?? 0) / 1000),
                                  '式',
                                  1000,
                                  distributedPrice ?? 0,
                                  '',
                                  '',
                                  '',
                                  assetClasses.find(
                                      ac => ac.code === assetClassCode,
                                  ) ?? null,
                                  [],
                                  [],
                                  '',
                                  [],
                                  null,
                                  distributedPrice ?? 0,
                                  1000,
                                  null,
                                  new Date(),
                                  new Date(),
                              ),
                          }),
                      )
                : []),
        ];

        function createMergedCostItems() {
            assertsIsExists(
                previousConstructionStatement,
                '前回の工事明細が存在しません',
            );

            const mergedCostItems = previousConstructionStatement
                ? new MergeCostItems(
                      cloneDeep(previousConstructionStatement),
                      estimateCostItems.map(({ costItem }) => costItem),
                      construction,
                      previousAssetStatements || [],
                      isFirstDesignChange,
                  ).invoke()
                : [];

            return mergedCostItems;
        }

        return (
            previousConstructionStatement
                ? createMergedCostItems().map(merged => ({
                      merged,
                      previous: previousConstructionStatement?.costItems.find(
                          ci => ci.id === merged.mergedCostItemId,
                      ),
                  }))
                : estimateCostItems.map(({ costItem }) => ({
                      previous: undefined,
                      merged: costItem,
                  }))
        ).map(ci => ({
            ...ci,
            matchedAssetStatements: matchAssetStatements(
                ci.merged,
                Array.from(assetStatementFormValuesMap)
                    .filter(
                        ([key]) =>
                            key === previousConstructionStatement ||
                            key === estimationStatement,
                    )
                    .flatMap(([, v]) => v)
                    .map(formValue => ({
                        formValue,
                        assetClass:
                            assetClasses.find(
                                ac => ac.code === formValue.assetClassCode,
                            ) ?? null,
                        name: formValue.name ?? '',
                        buildingsId: formValue.buildingsId ?? '',
                    })),
            ).map(e => e.formValue),
        }));
    }

    function buildAssetStatementEntries({
        previousConstructionStatement,
        estimationStatement,
        isCollateral,
        costItemEntries,
        formValue: { classification },
    }: BuildAssetStatementEntryParams): AssetStatementEntry[] {
        const entries = [
            ...Array.from(assetStatementFormValuesMap)
                .filter(
                    ([key]) =>
                        key === previousConstructionStatement ||
                        key === estimationStatement,
                )
                .map(([key, formValues]) =>
                    formValues.map(
                        (
                            formValue,
                            index,
                        ): Omit<AssetStatementEntry, 'errors'> => ({
                            formValue,
                            previous: previousAssetStatements.find(
                                as =>
                                    as.constructionStatementId ===
                                        previousConstructionStatement?.id &&
                                    as.name === formValue.name &&
                                    as.assetClass?.code ===
                                        formValue.assetClassCode,
                            ),
                            // 実際にフォームに表示され、保存にも使用される資産金額
                            actualDistributedPrice:
                                // 建築工事かつ費用計上の資産でない (=資産クラスが費用ではない）場合は資産金額を自動計算
                                // ※費用計上金額の計算は、それ以外の資産金額が出揃わないできないので後で行う
                                !isCollateral &&
                                formValue.assetClassCode !== costAssetClass.code
                                    ? EstimationService.getDistributedAssetClassPrice(
                                          // ひとつだけの資産とマッチする明細項目のみを対象とする
                                          sum(
                                              costItemEntries
                                                  .filter(
                                                      ci =>
                                                          classification ===
                                                              Classification.Asset &&
                                                          ci
                                                              .matchedAssetStatements
                                                              .length === 1 &&
                                                          head(
                                                              ci.matchedAssetStatements,
                                                          ) == formValue,
                                                  )
                                                  .map(
                                                      ({ merged: { price } }) =>
                                                          price,
                                                  ),
                                          ),
                                          costItemEntries.map(
                                              ({ merged }) => merged,
                                          ),
                                      )
                                    : formValue.distributedPrice,
                            changeValue: (property, value) => {
                                const entries = Array.from(
                                    assetStatementFormValuesMap,
                                );

                                entries
                                    .filter(([k]) => k === key)
                                    .forEach(([, v]) => {
                                        const element = v[index];
                                        element[property] = value as any; // eslint-disable-line @typescript-eslint/no-explicit-any

                                        if (property === 'assetClassCode') {
                                            if (
                                                element.assetClassCode ===
                                                costAssetClass.code
                                            ) {
                                                element['name'] =
                                                    COST_ASSET_STATEMENT_NAME;
                                                element['distributedPrice'] =
                                                    undefined;
                                            } else {
                                                element['name'] = undefined;
                                            }
                                        }
                                    });

                                setAssetStatementFormValuesMap(
                                    new Map(entries),
                                );
                            },
                            onClickDelete: () => {
                                setAssetStatementFormValuesMap(
                                    new Map(
                                        Array.from(
                                            assetStatementFormValuesMap,
                                        ).map(([k, v]) => [
                                            k,
                                            k === key
                                                ? v.filter(
                                                      (e, i) => i !== index,
                                                  )
                                                : v,
                                        ]),
                                    ),
                                );
                            },
                        }),
                    ),
                )
                .flat()
                .map(e => ({ ...e, errors: [] })),
        ];

        // 費用計上金額を計算
        return entries
            .map(as => ({
                ...as,
                actualDistributedPrice:
                    classification === Classification.Asset &&
                    as.formValue.assetClassCode == costAssetClass.code
                        ? EstimationService.getDistributedCost({
                              classification: classification,
                              assetStatements: entries
                                  .filter(
                                      ({ formValue: { assetClassCode } }) =>
                                          assetClassCode !==
                                          costAssetClass.code,
                                  )
                                  .map(
                                      ({
                                          actualDistributedPrice:
                                              distributedPrice = 0,
                                      }) => ({
                                          distributedPrice,
                                      }),
                                  ),
                              costItems: costItemEntries.map(
                                  ({ merged }) => merged,
                              ),
                          })
                        : as.actualDistributedPrice,
            }))
            .sort((a, b) => {
                // 費用計上を一番下に表示
                if (a.formValue.assetClassCode === 0) return 1;
                if (b.formValue.assetClassCode === 0) return -1;
                return 0;
            });
    }

    return buildBaseEntries()
        .map(e => ({
            ...e,
            costItemEntries: buildCostItemEntries(e),
        }))
        .map(e => ({
            ...e,
            assetStatementEntries: buildAssetStatementEntries(e),
        }))
        .map(e => ({
            ...e,
            // エラー判定
            errors: [
                ...(!e.formValue.classification
                    ? ['資産 or 費用が指定されていません']
                    : []),
                ...(!e.formValue.projectCode
                    ? ['PJコードが指定されていません']
                    : []),
                ...(!e.name ? ['名前がが読み取れません'] : []),
                ...(isNil(e.isCollateral)
                    ? ['附帯工事フラグが読み取れません']
                    : []),
                ...(isNil(e.term) ? ['工事工期が読み取れません'] : []),
            ],
            assetStatementEntries: e.assetStatementEntries.map(as => ({
                ...as,
                errors: [
                    ...(isNil(as.formValue.assetClassCode)
                        ? ['資産クラスが指定されていません']
                        : isNil(
                              assetClasses.find(
                                  ac => ac.code === as.formValue.assetClassCode,
                              ),
                          )
                        ? [
                              `資産クラス(コード:${as.formValue.assetClassCode})がみつかりません`,
                          ]
                        : []),
                    ...(isNil(as.formValue.name) || as.formValue.name === ''
                        ? ['資産名が指定されていません']
                        : []),
                    ...(isNil(as.actualDistributedPrice)
                        ? ['資産金額が計算できません']
                        : []),
                    ...(as.actualDistributedPrice &&
                    as.actualDistributedPrice < 0
                        ? ['金額が 0以下 の資産は登録できません']
                        : []),
                ],
            })),
            costItemEntries: e.costItemEntries.map(ci => ({
                ...ci,
                errors: [
                    ...(isNil(ci.merged.assetClass)
                        ? [
                              `資産クラスを特定できません。資産クラスマスタの資産計上区分に「${ci.merged.assetClassInfo}」が登録されているか確認してください。`,
                          ]
                        : []),
                    // ...(!isNil(ci.merged.assetClass) &&
                    // ConstructionTypes.isCapitalization(
                    //     ci.merged.constructionType,
                    // ) &&
                    // ci.matchedAssetStatements.length === 0
                    //     ? ['対象資産がみつかりません']
                    //     : []),
                    ...(ci.matchedAssetStatements.length > 1
                        ? [
                              `対象資産を特定できません ${ci.matchedAssetStatements
                                  .map(({ name }) => name)
                                  .join(',')}`,
                          ]
                        : []),
                ],
            })),
        }))
        .map(e => ({
            ...e,
            constructionStatementForStore:
                e.errors.length === 0 &&
                e.costItemEntries.every(ci => ci.errors.length === 0)
                    ? (() => {
                          assertsIsNotNull(e.formValue.classification);
                          assertsIsNotNull(e.formValue.projectCode);
                          assertsIsNotNull(e.isCollateral);
                          assertsIsNotNull(e.term);
                          assertsIsNotNull(e.name);

                          return {
                              classification: e.formValue.classification,
                              costItems: e.costItemEntries.map(
                                  ({ merged }) => merged,
                              ),
                              name: e.name,
                              projectCode: e.formValue.projectCode,
                              term: e.term,
                              isCollateral: e.isCollateral,
                              previousConstructionStatementId:
                                  e.previousConstructionStatement?.id ?? null,
                          };
                      })()
                    : undefined,
        }))
        .map(e => ({
            ...e,
            assetStatementsForStore:
                e.constructionStatementForStore &&
                e.assetStatementEntries.every(as => as.errors.length === 0)
                    ? e.assetStatementEntries
                          .map(e => ({
                              ...e,
                              assetClass: assetClasses.find(
                                  ac => ac.code === e.formValue.assetClassCode,
                              ),
                          }))
                          .map(
                              ({
                                  assetClass,
                                  formValue: { name, buildingsId },
                                  actualDistributedPrice,
                                  previous,
                              }): AssetStatementForStore => {
                                  assertsIsNotNull(
                                      e.constructionStatementForStore,
                                  );
                                  assertsIsNotNull(assetClass);
                                  assertsIsNotNull(name);
                                  assertsIsNotNull(actualDistributedPrice);
                                  return {
                                      constructionStatement:
                                          e.constructionStatementForStore,
                                      name,
                                      assetClass,
                                      distributedPrice: actualDistributedPrice,
                                      constructionTypeSerialNumber:
                                          previous?.constructionTypeSerialNumber ??
                                          null,
                                      buildingsId: buildingsId
                                          ? buildingsId
                                          : null,
                                  };
                              },
                          )
                    : undefined,
        }));
};

export default buildConstructionStatementEntries;
