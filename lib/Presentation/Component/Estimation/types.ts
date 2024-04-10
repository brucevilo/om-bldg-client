import {
    AssetStatement,
    Building,
    Classification,
    ConstructionStatement,
    CostItem,
} from '@/Domain/Entity';
import {
    ConstructionStatementForStore,
    AssetStatementForStore,
} from '@/Domain/Repository';
import { EstimationStatement } from '@/Domain/Service';
import { ChangeEvent } from 'react';

export type EstimationResult = {
    constructionStatements: ConstructionStatementForStore[];
    assetStatements: AssetStatementForStore[];
};

export type ConstructionStatementEntryKey =
    | EstimationStatement
    | ConstructionStatement;

export type ConstructionStatementFormValue = Partial<
    Pick<ConstructionStatement, 'projectCode' | 'classification'>
>;

export type AssetStatementFormValue = {
    assetClassCode?: number;
    name?: string;
    distributedPrice?: number;
    line?: string;
    buildingType?: string;
    buildingTypeList?: string[];
    buildingsId?: number;
    buildingList?: Building[];
};

export type CostItemEntry = {
    merged: CostItem;
    previous: CostItem | undefined;
    errors: string[];
    matchedAssetStatements: AssetStatementFormValue[];
};

export type AssetStatementEntry = {
    actualDistributedPrice: number | undefined;
    formValue: AssetStatementFormValue;
    previous: AssetStatement | undefined;
    errors: string[];
    changeValue: (
        name: keyof AssetStatementFormValue,
        value: string | number | Building[] | undefined | string[] | boolean,
    ) => void;
    onClickDelete: () => void;
};

export type ConstructionStatementEntry = {
    previousConstructionStatement: ConstructionStatement | undefined;
    estimationStatement: EstimationStatement | undefined;
    name: string | undefined;
    isCollateral: boolean | undefined;
    term: Date | undefined;
    formValue: ConstructionStatementFormValue;
    formValueKey: ConstructionStatementEntryKey;
    errors: string[];
    changeFormValue: (
        name: keyof ConstructionStatementFormValue,
        value: string | number | Classification,
    ) => void;
    onChangePreviousConstructionStatement: (
        event: ChangeEvent<HTMLInputElement>,
    ) => void;
    onClickAddAssetStatement: () => void;
    costItemEntries: CostItemEntry[];
    assetStatementEntries: AssetStatementEntry[];
    constructionStatementForStore: ConstructionStatementForStore | undefined;
    assetStatementsForStore: AssetStatementForStore[] | undefined;
};

export type BaseEntry = Omit<
    ConstructionStatementEntry,
    | 'costItemEntries'
    | 'assetStatementEntries'
    | 'constructionStatementForStore'
    | 'assetStatementsForStore'
>;

export type BuildAssetStatementEntryParams = BaseEntry & {
    costItemEntries: Array<Omit<CostItemEntry, 'errors'>>;
};
