import React, { useState, useEffect } from 'react';
import { Page } from '@/Presentation/Component';
import { Breadcrumb, Button, Tab, Tabs } from 'react-bootstrap';
import { NextPage } from 'next';
import { SapFixedAssetTabTable } from '@/App/Migrations/components/SapFixedAssetTabTable';
import { MigratedConstructionsTabTable } from '@/App/Migrations/components/MigratedConstructionsTabTable';
import { MigratedDesignsTabTable } from '@/App/Migrations/components/MigratedDesignsTabTable';
import {
    ConstructionRepository,
    DesignRepository,
    SapFixedAssetRepository,
} from '@/Domain/Repository';
import { Construction, Design, SapFixedAsset } from '@/Domain/Entity';
import { MigratedConstructionRepository } from '@/App/Migrations/apps/repositories/ConstructionRepository';
import { MigratedDesignRepository } from '@/App/Migrations/apps/repositories/DesignRepository';

async function createConstructionAndDesignFromSapFixedAsset(): Promise<void> {
    const createdDesigns =
        await MigratedDesignRepository.createFromSapFixedAssets();
    const createdConstructions =
        await MigratedConstructionRepository.createFromSapFixedAssets();
    alert(
        `工事を${createdConstructions.length}件、設計を${createdDesigns.length}件作成しました。`,
    );
}

const Migrations: NextPage = () => {
    const [tab, setTab] = useState<string>('sap');
    const [sapFixedAssets, setSapFixedAssets] = useState<SapFixedAsset[]>([]);
    const [migratedConstructions, setMigratedConstructions] = useState<
        Construction[]
    >([]);
    const [migratedDesigns, setMigratedDesigns] = useState<Design[]>([]);
    const [currentSapFixedAssetPage, setCurrentSapFixedAssetPage] =
        useState<number>(1);
    const [totalSapFixedAssetPages, setTotalSapFixedAssetPages] =
        useState<number>(1);
    const [currentConstructionPage, setCurrentConstructionPage] =
        useState<number>(1);
    const [totalConstructionPages, setTotalConstructionPages] =
        useState<number>(1);
    const [currentDesignPage, setCurrentDesignPage] = useState<number>(1);
    const [totalDesignPages, setTotalDesignPages] = useState<number>(1);

    const fetchSapFixedAssetData = async () => {
        const sapFixedAssets = await SapFixedAssetRepository.list(
            currentSapFixedAssetPage,
        );
        setSapFixedAssets(sapFixedAssets.values);
        if (sapFixedAssets.totalPages)
            setTotalSapFixedAssetPages(sapFixedAssets.totalPages);
    };

    const fetchMigratedConstructionData = async () => {
        const constructionSearchResult =
            // 移行ツール経由で作成されたmigrationを取得したいだけなので、キーワードもnext_actionも空文字にして、made_by_migrationがtrueのConstructionのみ取得する
            await ConstructionRepository.search(
                '',
                '',
                currentConstructionPage,
                true,
            );
        setMigratedConstructions(constructionSearchResult.values);
        setTotalConstructionPages(constructionSearchResult.totalPages || 1);
    };

    const fetchMigratedDesignData = async () => {
        const designSearchResult =
            // 移行ツール経由で作成されたmigrationを取得したいだけなので、キーワードもnext_actionも空文字にして、made_by_migrationがtrueのConstructionのみ取得する
            await DesignRepository.search('', '', currentDesignPage, true);
        setMigratedDesigns(designSearchResult.values);
        setTotalDesignPages(designSearchResult.totalPages || 1);
    };

    // 余計なデータを取得しないようにタブごとにuseEffectを分割
    useEffect(() => {
        fetchSapFixedAssetData();
    }, [currentSapFixedAssetPage]);

    useEffect(() => {
        fetchMigratedConstructionData();
    }, [currentConstructionPage]);

    useEffect(() => {
        fetchMigratedDesignData();
    }, [currentDesignPage]);

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>移行ツール</Breadcrumb.Item>
                </Breadcrumb>
                <div
                    className='d-flex mb-4'
                    style={{ justifyContent: 'space-between' }}
                >
                    <div>
                        <h3 className='font-weight-bold'>移行ツール</h3>
                    </div>
                    <div>
                        <Button
                            variant='primary'
                            onClick={() =>
                                createConstructionAndDesignFromSapFixedAsset()
                            }
                        >
                            工事/設計一覧を作成
                        </Button>
                    </div>
                </div>
                <Tabs activeKey={tab} onSelect={k => setTab(k as string)}>
                    <Tab title='SAP固定資産台帳' eventKey='sap'>
                        <SapFixedAssetTabTable
                            sapFixedAssets={sapFixedAssets}
                            currentPage={currentSapFixedAssetPage}
                            totalPages={totalSapFixedAssetPages}
                            setCurrentPage={setCurrentSapFixedAssetPage}
                        />
                    </Tab>
                    <Tab title='工事' eventKey='constructions'>
                        <MigratedConstructionsTabTable
                            migratedConstructions={migratedConstructions}
                            currentPage={currentConstructionPage}
                            totalPages={totalConstructionPages}
                            setCurrentPage={setCurrentConstructionPage}
                        />
                    </Tab>
                    <Tab title='設計' eventKey='design'>
                        <MigratedDesignsTabTable
                            migratedDesigns={migratedDesigns}
                            currentPage={currentDesignPage}
                            totalPages={totalDesignPages}
                            setCurrentPage={setCurrentDesignPage}
                        />
                    </Tab>
                </Tabs>
            </section>
        </Page>
    );
};

export default Migrations;
