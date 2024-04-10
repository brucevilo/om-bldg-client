import React, { useEffect, useState } from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Estimation } from '@/Presentation/Component/Estimation';
import {
    AssetClass,
    AssetStatement,
    Classification,
    Construction,
    ConstructionStatement,
    Contract,
    CostItem,
    MigrationStatus,
} from '@/Domain/Entity';

export default {
    title: '工事',
    component: Estimation,
} as ComponentMeta<typeof Estimation>;
import axios from 'axios';
import { DocumentNumber } from '@/Domain/ValueObject/DocumentNumber';
import { EstimationService, EstimationStatement } from '@/Domain/Service';

const Template: ComponentStory<typeof Estimation> = args => {
    const { construction } = args;

    const [previousConstructionStatements, setPreviousConstructionStatements] =
        useState<ConstructionStatement[]>([]);

    const [estimates, setEstimates] = useState<EstimationStatement[]>([]);

    useEffect(() => {
        (async () => {
            setPreviousConstructionStatements(
                await extractConstructionStatements(
                    assetClasses,
                    construction,
                    '/files/工事A_元設計_工事内訳書.xlsm',
                ),
            );

            setEstimates(
                await extractEstimatesFromUrl(
                    '/files/工事A_第二回設計変更_内訳書.xlsm',
                    assetClasses,
                    construction,
                ),
            );
        })();
    }, []);

    return (
        <Estimation
            {...{
                ...args,
                previousConstructionStatements,
            }}
            estimates={estimates}
        />
    );
};

const assetClasses: AssetClass[] = [
    createAssetClass({
        name: '費用',
        accountDivision: '費用',
        code: 0,
    }),
    createAssetClass({
        name: '鉄有固-運送施設 建物-鉄骨鉄筋コンクリート造又は鉄筋コンクリート造-停車場建物',
        accountDivision: '建物',
        code: 10500701,
    }),
    createAssetClass({
        name: '非電照サイン（金属製）',
        accountDivision: '非電照サイン（金属製）,非電照サイン（その他）',
        code: 12505959,
    }),
];

export const 内訳書登録 = Template.bind({});

内訳書登録.args = {
    assetClasses,
    construction: new Construction(
        1,
        '東梅田外１駅可動式ホーム柵設置に伴う建築その他工事',
        new DocumentNumber('20191010'),
        [
            new Contract({
                contractedPrice: 387720000,
                expectedPriceWithTax: 521316000,
            }),
        ],
        new Date(),
        new Date(),
        false,
        MigrationStatus.Open,
    ),
    previousAssetStatements: [
        createAssetStatement({
            constructionStatementId: 0,
            assetClassCode: 10500701,
            name: '東梅田駅（R2）建物',
            assessmentPrice: 30000000,
        }),
        createAssetStatement({
            constructionStatementId: 0,
            assetClassCode: 12505959,
            name: '東梅田駅（R5）サイン・広告-金属製以外',
            assessmentPrice: 2000000,
        }),
    ],
    projects: [
        { code: '001', name: '事業A' },
        { code: '002', name: '事業B' },
    ],
};

function createAssetClass({
    name,
    accountDivision,
    code,
}: Pick<AssetClass, 'name' | 'accountDivision' | 'code'>) {
    return new AssetClass(
        null,
        name,
        accountDivision,
        code,
        null,
        '',
        '',
        '',
        new Date(),
        new Date(),
    );
}

function createAssetStatement({
    assetClassCode,
    constructionStatementId,
    name,
    assessmentPrice,
}: Partial<Omit<AssetStatement, 'assetClass'>> & { assetClassCode: number }) {
    return new AssetStatement(
        null,
        constructionStatementId || 0,
        getAssetClass(assetClassCode),
        name || '',
        0,
        '',
        null,
        null,
        false,
        null,
        null,
        0,
        assessmentPrice || null,
        new Date(),
        new Date(),
        null,
    );
}

async function extractEstimatesFromUrl(
    url: string,
    assetClasses: AssetClass[],
    construction: Construction,
): Promise<EstimationStatement[]> {
    return EstimationService.extractEstimationStatements(
        (await axios.get(url, { responseType: 'arraybuffer' })).data,
        assetClasses,
        construction,
        construction.contracts.length > 1,
    );
}

async function extractConstructionStatements(
    assetClasses: AssetClass[],
    construction: Construction,
    path: string,
): Promise<ConstructionStatement[]> {
    return (
        await extractEstimatesFromUrl(path, assetClasses, construction)
    ).map(
        (e, id): ConstructionStatement =>
            new ConstructionStatement(
                id,
                0,
                e.name,
                '',
                e.term,
                e.estimationItems.map(
                    (ei): CostItem =>
                        EstimationService.estimationItemToCostItem(
                            ei,
                            assetClasses,
                        ),
                ),
                Classification.Asset,
                false,
                false,
                null,
                null,
                false,
                null,
                null,
                null,
                [],
                new Date(),
                new Date(),
            ),
    );
}

function getAssetClass(assetClassCode: number): AssetClass {
    const assetClass = assetClasses.find(ac => ac.code === assetClassCode);
    if (!assetClass) {
        throw `資産クラスが見つかりません。${assetClassCode}`;
    }
    return assetClass;
}
