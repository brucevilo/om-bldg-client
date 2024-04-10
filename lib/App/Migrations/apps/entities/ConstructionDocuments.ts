import { ConstructionStatement } from './ConstructionStatement';
import { readCostDocument } from '../CostDocument';
import { DesignStatement } from './DesignStatement';
import { convertToAscii } from '../utils';
import { SapRecordMap } from '../SapDocument';
import { MigrationConstruction } from './MigrationConstruction';

export type DesignStatementMap = {
    [designChangeNumber: number]: DesignStatement;
};

export class ConstructionDocuments {
    private constructor(
        private _migrationConstruction: MigrationConstruction,
        private _designStatementMap: DesignStatementMap,
        private _mergedDesignStatementMap: DesignStatementMap,
    ) {}

    public get migrationConstruction(): MigrationConstruction {
        return this._migrationConstruction;
    }
    public get designStatementMap(): DesignStatementMap {
        return { ...this._designStatementMap };
    }
    public get mergedDesignStatementMap(): DesignStatementMap {
        return { ...this._mergedDesignStatementMap };
    }
    public get lastMergedDesignStatement(): DesignStatement {
        const mdss = Object.values(this._mergedDesignStatementMap);
        return mdss[mdss.length - 1];
    }

    public clone(): ConstructionDocuments {
        const ret = new ConstructionDocuments(
            this.migrationConstruction,
            this.designStatementMap,
            this.mergedDesignStatementMap,
        );
        return ret;
    }

    public updateDesignStatement(
        designStatement: DesignStatement,
    ): ConstructionDocuments {
        const ret = this.clone();
        ret._designStatementMap[designStatement.designChangeNumber] =
            designStatement;
        return ret;
    }

    public setMigrationConstruction(
        mc: MigrationConstruction,
    ): ConstructionDocuments {
        const ret = this.clone();
        ret._migrationConstruction = mc;
        return ret;
    }

    public async addCostDocument(file: File): Promise<ConstructionDocuments> {
        const ret = this.clone();
        const designStatementMaster = await readCostDocument(file);
        if (
            ret._migrationConstruction.name !== '' &&
            ret._migrationConstruction.name !==
                designStatementMaster.constructionName
        ) {
            throw new Error(`工事名称が異なります。: ${file.name}`);
        }
        ret._migrationConstruction = ret._migrationConstruction.setName(
            designStatementMaster.constructionName,
        );
        const designStatement = DesignStatement.createFromMaster(
            designStatementMaster,
        );
        ret._designStatementMap[designStatement.designChangeNumber] =
            designStatement;
        return ret;
    }

    public async addCostDocuments(
        fileList: FileList,
    ): Promise<ConstructionDocuments> {
        let ret = this.clone();
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            if (file.type.startsWith('application/vnd.ms-excel')) {
                ret = await ret.addCostDocument(file);
            }
        }
        return ret;
    }

    public isMerged(): boolean {
        return (
            Object.values(this._mergedDesignStatementMap).flatMap(v =>
                v.hasError(),
            ).length === 0
        );
    }

    public linkConstructionStatements(): ConstructionDocuments {
        const ret = this.clone();
        const designStatementMap: DesignStatementMap = {};
        let nameList: string[] = [];
        Object.values(ret._designStatementMap).forEach(ds => {
            ds.constructionStatements.forEach(cs => {
                // 未特定工事明細のうち前設計以前に同一名称のものがある場合は親に設定
                if (
                    cs.parentName === ConstructionStatement.NAME_UNKNOWN &&
                    nameList.includes(cs.name)
                ) {
                    ds = ds.updateConstructionStatement(
                        cs.setParentName(cs.name),
                    );
                }
            });
            nameList = Array.from(
                new Set(nameList.concat(...ds.constructionStatementNames)),
            );
            designStatementMap[ds.designChangeNumber] = ds;
        });
        ret._designStatementMap = designStatementMap;
        return ret;
    }

    public linkSapRecord(sapRecordMap: SapRecordMap): ConstructionDocuments {
        const ret = this.clone();
        const sapRecords = Object.values(sapRecordMap).filter(record =>
            this._migrationConstruction.recordKeys.includes(record.assetKey),
        );

        Object.values(ret._designStatementMap).forEach(ds => {
            ds.constructionStatements.forEach(cs => {
                cs.assetClassDivisions.forEach(acd => {
                    if (acd.isLinked()) {
                        return;
                    }
                    const candidate = sapRecords.filter(record =>
                        acd.isCandidate(record),
                    );
                    cs.assetItemsMaster.forEach(ai => {
                        if (!acd.isCandidate(ai)) {
                            return;
                        }
                        const candidate2 = candidate.filter(
                            c => c.assetClassCode === ai.assetClassCode,
                        );
                        if (candidate2.length === 1) {
                            cs = cs.updateAssetClassDivision(
                                acd.setAssetKey(candidate2[0].assetKey),
                            );
                            return;
                        }
                        const candidate3 = candidate2.filter(
                            c => c.assetName === ai.assetName,
                        );
                        if (candidate3.length === 1) {
                            cs = cs.updateAssetClassDivision(
                                acd.setAssetKey(candidate3[0].assetKey),
                            );
                        }
                    });
                });
                ds = ds.updateConstructionStatement(cs);
            });
            ret._designStatementMap[ds.designChangeNumber] = ds;
        });
        return ret;
    }

    public mergeDesignStatement(): ConstructionDocuments {
        const ret = this.clone();
        const mcsMap: {
            [constructionStatementName: string]: ConstructionStatement;
        } = {};
        Object.values(ret._designStatementMap).forEach(ds => {
            ds.constructionStatements.forEach(cs => {
                // 初出の工事明細
                if (mcsMap[cs.uniqueName] === undefined) {
                    mcsMap[cs.uniqueName] = cs.resetItems();
                    if (cs.parentName === ConstructionStatement.NAME_NEW) {
                        // 新規の工事明細
                        cs.items.forEach(newItem => {
                            const update = newItem.setParentId(newItem.id);
                            const same = mcsMap[cs.uniqueName].items.find(i =>
                                i.isSame(newItem),
                            );
                            if (same) {
                                mcsMap[cs.uniqueName] = mcsMap[
                                    cs.uniqueName
                                ].mergeCostItem(same, newItem);
                            } else {
                                mcsMap[cs.uniqueName] =
                                    mcsMap[cs.uniqueName].addCostItem(newItem);
                            }
                            cs = cs.updateCostItem(update);
                            ds = ds.updateConstructionStatement(cs);
                        });
                    } else {
                        cs.items.forEach(newItem => {
                            const same = mcsMap[cs.uniqueName].items.find(i =>
                                i.isSame(newItem),
                            );
                            if (same) {
                                mcsMap[cs.uniqueName] = mcsMap[
                                    cs.uniqueName
                                ].mergeCostItem(same, newItem);
                            } else {
                                mcsMap[cs.uniqueName] =
                                    mcsMap[cs.uniqueName].addCostItem(newItem);
                            }
                        });
                    }
                    mcsMap[cs.uniqueName] =
                        mcsMap[cs.uniqueName].updateAssetClassDivisions(cs);
                    return;
                }
                // 資産管理明細書をマージ
                cs.assetItemsMaster.forEach(newItem => {
                    if (newItem.prevPrice === 0) {
                        mcsMap[cs.uniqueName] =
                            mcsMap[cs.uniqueName].addAssetItemMaster(newItem);
                    } else {
                        mcsMap[cs.uniqueName] =
                            mcsMap[cs.uniqueName].updateAssetItemMaster(
                                newItem,
                            );
                    }
                });
                // 明細項目をマージ
                mcsMap[cs.uniqueName] = mcsMap[cs.uniqueName]
                    .setDesignChangeNumber(cs.designChangeNumber)
                    .setParentName(cs.parentName);
                cs.items.forEach(newItem => {
                    const prevItem = mcsMap[cs.uniqueName].items.find(item => {
                        return item.id === newItem.parentId;
                    });
                    if (prevItem) {
                        mcsMap[cs.uniqueName] = mcsMap[
                            cs.uniqueName
                        ].mergeCostItem(prevItem, newItem);
                        return;
                    }
                    // 工事種別と名称が一致するものを検索
                    const newItemAsciiName = convertToAscii(newItem.name);
                    let prevItems = mcsMap[cs.uniqueName].items.filter(
                        prevItem => {
                            return (
                                convertToAscii(prevItem.name) ===
                                    newItemAsciiName &&
                                prevItem.constructionType ===
                                    newItem.constructionType
                            );
                        },
                    );

                    // 共通仮設費は合算
                    if (
                        prevItems.length === 1 &&
                        prevItems[0].constructionType === '共通仮設費'
                    ) {
                        const prevItem = prevItems[0];
                        const update = newItem.parentId
                            ? newItem
                            : newItem.setParentId(prevItem.id);
                        mcsMap[cs.uniqueName] = mcsMap[
                            cs.uniqueName
                        ].mergeCostItem(prevItem, newItem);
                        cs = cs.updateCostItem(update);
                        ds = ds.updateConstructionStatement(cs);
                        return;
                    }

                    // 候補が複数残っている場合、単価・形状が等しいものを検索
                    if (prevItems.length > 1) {
                        prevItems = prevItems.filter(prevItem => {
                            return (
                                Math.abs(prevItem.unitPrice) ===
                                    Math.abs(newItem.unitPrice) &&
                                prevItem.dimension === newItem.dimension
                            );
                        });
                    }

                    // 候補がない場合
                    if (prevItems.length === 0) {
                        // 価格が負もしくは数量が負の場合は未特定項目へ
                        if (newItem.price < 0 || newItem.amount < 0) {
                            mcsMap[cs.uniqueName] =
                                mcsMap[cs.uniqueName].addCostItem(newItem);
                            return;
                        }
                        // 残りは新規追加
                        const update = newItem.parentId
                            ? newItem
                            : newItem.setParentId(newItem.id);
                        mcsMap[cs.uniqueName] =
                            mcsMap[cs.uniqueName].addCostItem(update);
                        cs = cs.updateCostItem(update);
                        ds = ds.updateConstructionStatement(cs);
                        // 候補が絞りきれない場合
                    } else if (prevItems.length > 1) {
                        mcsMap[cs.uniqueName] =
                            mcsMap[cs.uniqueName].addCostItem(newItem);
                    } else {
                        // 候補がひとつに絞れた場合
                        const prevItem = prevItems[0];
                        const update = newItem.parentId
                            ? newItem
                            : newItem.setParentId(prevItem.id);
                        mcsMap[cs.uniqueName] = mcsMap[
                            cs.uniqueName
                        ].mergeCostItem(prevItem, newItem);
                        cs = cs.updateCostItem(update);
                        ds = ds.updateConstructionStatement(cs);
                    }
                });
                // 資産区分をマージ
                cs.assetClassDivisions.forEach(acd => {
                    const pacd = mcsMap[cs.uniqueName].assetClassDivisions.find(
                        pacd => pacd.type === acd.type,
                    );
                    if (!pacd || !pacd.isLinked()) {
                        return;
                    }
                    cs = cs.updateAssetClassDivision(
                        acd.setAssetKey(pacd.assetKey),
                    );
                    ds = ds.updateConstructionStatement(cs);
                });
                mcsMap[cs.uniqueName] =
                    mcsMap[cs.uniqueName].updateAssetClassDivisions(cs);
            });
            ret._designStatementMap[ds.designChangeNumber] = ds;
            ret._mergedDesignStatementMap[ds.designChangeNumber] =
                ds.setConstructionStatements(Object.values(mcsMap));
        });
        return ret;
    }

    public static create(mc?: MigrationConstruction): ConstructionDocuments {
        return new ConstructionDocuments(
            mc ? mc : MigrationConstruction.create(),
            {},
            {},
        );
    }
}
