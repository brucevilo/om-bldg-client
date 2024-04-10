import React, { FC, useState } from 'react';
import { Table } from 'react-bootstrap';
import { MigrationConstruction } from '../apps/entities/MigrationConstruction';
import { SapRecordMap } from '../apps/SapDocument';
import { MigrationConstructionRow } from './MigrationConstructionRow';

type Props = {
    constructions: MigrationConstruction[];
    sapRecordMap: SapRecordMap;
    onChange(constructions: MigrationConstruction[]): void;
    onRegister(construction: MigrationConstruction): void;
};

type ConstructionSapRecordMap = {
    [constructionId: string]: string[];
};

export const MigrationConstructionTable: FC<Props> = ({
    constructions,
    sapRecordMap,
    onChange,
    onRegister,
}) => {
    const [selectedItems, setSelectedItems] = useState<MigrationConstruction[]>(
        [],
    );
    const [constructionSapRecordMap, setConstructionSapRecordMap] =
        useState<ConstructionSapRecordMap>({});
    return (
        <Table>
            <tbody>
                {constructions.map(construction => (
                    <MigrationConstructionRow
                        key={construction.year + construction.name}
                        construction={construction}
                        sapRecordMap={sapRecordMap}
                        onChange={item => {
                            const newConstructions = [...constructions];
                            const index =
                                newConstructions.indexOf(construction);
                            newConstructions.splice(index, 1, item);
                            onChange(newConstructions);
                        }}
                        onSelect={() => {
                            selectedItems.push(construction);
                        }}
                        onDeselect={() => {
                            setSelectedItems(selectedItems => {
                                return selectedItems.filter(
                                    v => v !== construction,
                                );
                            });
                        }}
                        onSelectAsset={item => {
                            const newConstructionSapRecordMap = {
                                ...constructionSapRecordMap,
                                [construction.id]: constructionSapRecordMap[
                                    construction.id
                                ]
                                    ? constructionSapRecordMap[
                                          construction.id
                                      ].concat([item.assetKey])
                                    : [item.assetKey],
                            };
                            setConstructionSapRecordMap(
                                newConstructionSapRecordMap,
                            );
                        }}
                        onDeselectAsset={item => {
                            const newRecords = constructionSapRecordMap[
                                construction.id
                            ].filter(v => v !== item.assetKey);
                            const newConstructionSapRecordMap = {
                                ...constructionSapRecordMap,
                            };
                            if (newRecords.length === 0) {
                                delete newConstructionSapRecordMap[
                                    construction.id
                                ];
                            } else {
                                newConstructionSapRecordMap[construction.id] =
                                    newRecords;
                            }
                            setConstructionSapRecordMap(
                                newConstructionSapRecordMap,
                            );
                        }}
                        onMerge={() => {
                            const items = selectedItems.filter(
                                v => v !== construction,
                            );
                            let newConstruction = construction;
                            let newConstructions = constructions;
                            delete constructionSapRecordMap[construction.id];
                            items.forEach(item => {
                                delete constructionSapRecordMap[item.id];
                                newConstruction = newConstruction.addRecordKey(
                                    ...item.recordKeys,
                                );
                            });
                            Object.keys(constructionSapRecordMap).forEach(
                                id => {
                                    newConstruction =
                                        newConstruction.addRecordKey(
                                            ...constructionSapRecordMap[id],
                                        );
                                    const targetConstruction =
                                        constructions.find(c => c.id === id);
                                    if (targetConstruction === undefined) {
                                        return;
                                    }
                                    newConstructions.splice(
                                        newConstructions.indexOf(
                                            targetConstruction,
                                        ),
                                        1,
                                        targetConstruction.removeRecordKey(
                                            ...constructionSapRecordMap[id],
                                        ),
                                    );
                                },
                            );
                            newConstructions.splice(
                                newConstructions.indexOf(construction),
                                1,
                                newConstruction,
                            );
                            newConstructions = newConstructions.filter(
                                v => !items.includes(v),
                            );
                            onChange(newConstructions);
                            setSelectedItems([]);
                            setConstructionSapRecordMap({});
                        }}
                        conflicted={
                            constructions.filter(
                                v => v.name === construction.name,
                            ).length > 1
                        }
                        onRegister={() => onRegister(construction)}
                    ></MigrationConstructionRow>
                ))}
            </tbody>
        </Table>
    );
};
