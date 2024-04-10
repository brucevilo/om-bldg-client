import React, { useEffect, useState } from 'react';
import {
    AssetChecklistModal,
    AssetChecklistRows,
    Loading,
    Page,
    PagingButtons,
} from '@/Presentation/Component';
import { NextPage } from 'next';
import {
    Badge,
    Breadcrumb,
    Button,
    Form,
    Table,
    Card,
    Col,
} from 'react-bootstrap';
import {
    AssetStatement,
    ConstructionStatement,
    CostItemTag,
    RetirementCostItem,
    SapFixedAsset,
    Contract,
} from '@/Domain/Entity';
import {
    AssetChecklistRepository,
    AssetStatementRepository,
    ConstructionStatementRepository,
    ContractRepository,
    RetirementCostItemRepository,
    SapFixedAssetRepository,
} from '@/Domain/Repository';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { uniq } from 'lodash';
import { ChecklistGroup } from '@/Domain/ValueObject';
import { useSession } from '@/App/Hook/useSession';

interface State {
    constructionStatements: ConstructionStatement[];
    assetStatements: AssetStatement[];
    sapFixedAssets: SapFixedAsset[];
    retirementCostItems: RetirementCostItem[];
}

const Assets: NextPage = () => {
    const [searchStartAt, setSearchStartAt] = useState<string>('');
    const [searchEndAt, setSearchEndAt] = useState<string>('');
    const [newTagName, setNewTagName] = useState<string>('');
    const [searchCostItemTags, setSearchCostItemTags] = useState<CostItemTag[]>(
        [],
    );
    const [checkCostItemGroups, setCheckCostItemGroups] = useState<
        ChecklistGroup[]
    >([]);
    const [showAssetChecklistModal, setShowAssetChecklistModal] =
        useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isFilteredUncheckedAsset, setisFilteredUncheckedAssets] =
        useState<boolean>(false);
    const [state, setState] = useState<State>();
    const [isLoading, setIsLoading] = useState(false);
    const [contractList, setContractList] = useState<Contract[]>([]);
    const session = useSession();

    const fetchData = async () => {
        const stringifiedChecklistGroups =
            localStorage.getItem('checklist_groups');
        if (stringifiedChecklistGroups)
            setCheckCostItemGroups(
                ChecklistGroup.parsedChecklist(stringifiedChecklistGroups),
            );
        const { values, totalPages } = await SapFixedAssetRepository.search(
            currentPage,
            isFilteredUncheckedAsset,
            searchStartAt,
            searchEndAt,
            searchCostItemTags,
        );
        if (totalPages) setTotalPages(totalPages);
        const assetStatements =
            await AssetStatementRepository.mgetBySapFixedAssets(values);
        const constructionStatements =
            await ConstructionStatementRepository.mget(
                assetStatements.map(as => as.constructionStatementId),
                searchCostItemTags,
            );
        const retirementCostItems =
            await RetirementCostItemRepository.mgetByCostItems(
                constructionStatements.flatMap(cs => cs.costItems),
            );
        const unmatchedSapFixedAsset = values.filter(
            value => value.assetChecklists.length === 0,
        );
        setState({
            constructionStatements,
            assetStatements,
            sapFixedAssets: isFilteredUncheckedAsset
                ? unmatchedSapFixedAsset
                : values,
            retirementCostItems,
        });
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, isFilteredUncheckedAsset]);

    useEffect(() => {
        const fetchContracts = async () => {
            let sapFixedAssetIDs = '';
            state?.sapFixedAssets.forEach(asset => {
                sapFixedAssetIDs += `sap_fixed_asset_ids[]=${asset.id}&`;
            });
            const contracts =
                await ContractRepository.listContractsRelatedToSapFixedAsset({
                    sapFixedAssetIDs,
                });
            setContractList(contracts);
            setIsLoading(false);
        };
        setIsLoading(true);
        if (state?.sapFixedAssets) fetchContracts();
    }, [state]);

    if (!state) return null;
    const {
        constructionStatements,
        assetStatements,
        sapFixedAssets,
        retirementCostItems,
    } = state;

    const onSelectTag: React.KeyboardEventHandler<HTMLInputElement> = e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (!newTagName) return;
        const newSearchTag = new CostItemTag(
            null,
            null,
            newTagName,
            new Date(),
            new Date(),
        );
        if (!searchCostItemTags.some(tag => tag.name === newSearchTag.name))
            setSearchCostItemTags(searchCostItemTags.concat(newSearchTag));
        setNewTagName('');
        return false;
    };
    const searchTagOptions = () => {
        const tags = assetStatements.flatMap(as => {
            const relatedConstructionStatement = constructionStatements.find(
                cs => cs.id === as.constructionStatementId,
            );
            if (!relatedConstructionStatement) return;
            return relatedConstructionStatement.costItems.flatMap(item =>
                item.costItemTags.flatMap(t => t.name),
            );
        });
        return uniq(tags).map(name => <option key={name} value={name} />);
    };

    const onCompleteCheck = async () => {
        await AssetChecklistRepository.create(
            checkCostItemGroups.flatMap(group => group.costItems),
            checkCostItemGroups.flatMap(group => group.sapFixedAsset),
        );
        alert('現物照合が完了しました');
        localStorage.removeItem('checklist_groups');
        location.reload();
    };
    const onDownload = async () => {
        setIsDownloading(true);
        try {
            await SapFixedAssetRepository.downloadCsv();
        } catch {
            alert('ダウンロードに失敗しました。');
        }
        setIsDownloading(false);
    };

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>資産保全台帳</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>資産保全台帳</h3>
                    </div>
                </div>
                <Card className='mb-4'>
                    <Card.Body>
                        <Form className='bg-white p-3 mb-3'>
                            <Form.Label>取得日</Form.Label>
                            <Form.Row className='align-items-center mb-4'>
                                <Col xs='auto'>
                                    <Form.Control
                                        type='date'
                                        value={searchStartAt || ''}
                                        onChange={e =>
                                            setSearchStartAt(e.target.value)
                                        }
                                        max='3000-12-31'
                                    />
                                </Col>
                                <Col xs='auto' className='text-center'>
                                    〜
                                </Col>
                                <Col xs='auto'>
                                    <Form.Control
                                        type='date'
                                        value={searchEndAt || ''}
                                        onChange={e =>
                                            setSearchEndAt(e.target.value)
                                        }
                                        max='3000-12-31'
                                    />
                                </Col>
                                <Col xs='auto'>
                                    <Button
                                        variant='light'
                                        className='border bg-white'
                                        onClick={() => {
                                            setSearchStartAt('');
                                            setSearchEndAt('');
                                        }}
                                    >
                                        クリア
                                    </Button>
                                </Col>
                            </Form.Row>
                            <Form.Group>
                                <Form.Label>特定情報</Form.Label>
                                <Form.Control
                                    placeholder='特定情報を入力し、Enterを押してください。'
                                    value={newTagName}
                                    onChange={e =>
                                        setNewTagName(e.target.value)
                                    }
                                    onKeyDown={onSelectTag}
                                    autoComplete='on'
                                    list='tagList'
                                />
                                <span className='glyphicon glyphicon-ok form-control-feedback'></span>
                                <datalist id='tagList'>
                                    {searchTagOptions()}
                                </datalist>
                            </Form.Group>
                            <div className='d-flex mb-3'>
                                {searchCostItemTags.map((tag, index) => (
                                    <Badge
                                        key={index}
                                        className='mr-2 d-flex align-items-center'
                                    >
                                        <div className='p-2 bg-primary text-white'>
                                            {tag.name}
                                        </div>
                                        <Button
                                            as='a'
                                            className='p-2 bg-white border-0'
                                            onClick={() =>
                                                setSearchCostItemTags(
                                                    searchCostItemTags.filter(
                                                        t =>
                                                            t.name !== tag.name,
                                                    ),
                                                )
                                            }
                                        >
                                            <FA
                                                icon={faTimes}
                                                className='text-dark'
                                            />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                            <div className='text-right'>
                                <Button
                                    variant='light'
                                    className='border bg-white'
                                    type='button'
                                    onClick={async () => await fetchData()}
                                >
                                    検索する
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
                <Form.Check
                    label='未照合の資産のみに絞り込む'
                    className='d-flex align-items-center'
                    onChange={() =>
                        setisFilteredUncheckedAssets(!isFilteredUncheckedAsset)
                    }
                    checked={isFilteredUncheckedAsset}
                />
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '64px' }} />
                                <th style={{ width: '48px' }} />
                                <th style={{ width: '156px' }}>KEY</th>
                                <th style={{ width: '400px' }}>資産名称</th>
                                <th style={{ width: '300px' }}>特定情報</th>
                                <th style={{ width: '72px' }}>元数量</th>
                                <th style={{ width: '72px' }}>残数量</th>
                                <th style={{ width: '500px' }}>資産テキスト</th>
                                <th style={{ width: '134px' }}>現物照合日</th>
                                <th style={{ width: '134px' }}>取得日</th>
                                <th style={{ width: '160px' }}>取得価額</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td>
                                        <Loading zIndex={1} left={220} />
                                    </td>
                                </tr>
                            ) : (
                                <AssetChecklistRows
                                    sapFixedAssets={sapFixedAssets}
                                    assetStatements={assetStatements}
                                    constructionStatements={
                                        constructionStatements
                                    }
                                    checkCostItemGroups={checkCostItemGroups}
                                    retirementCostItems={retirementCostItems}
                                    contracts={contractList}
                                    setCheckCostItemGroups={
                                        setCheckCostItemGroups
                                    }
                                />
                            )}
                        </tbody>
                    </Table>
                </div>
                <div className='mb-5'>
                    <PagingButtons
                        page={currentPage}
                        totalPages={totalPages}
                        onChangePage={i => setCurrentPage(i)}
                        checklistGroups={checkCostItemGroups}
                    />
                </div>
            </section>
            <div
                className='d-flex justify-content-between position-sticky px-5 py-3 bg-white'
                style={{ bottom: '0' }}
            >
                <Button
                    variant='light'
                    className='bg-white border'
                    onClick={onDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? 'ダウンロード中' : 'CSVをダウンロードする'}
                </Button>
                <Button
                    variant='light'
                    className='bg-white border'
                    onClick={() => setShowAssetChecklistModal(true)}
                    disabled={checkCostItemGroups.length === 0}
                >
                    現物照合する
                </Button>
            </div>
            <AssetChecklistModal
                checkedGroups={checkCostItemGroups}
                showModal={showAssetChecklistModal}
                setShowModal={setShowAssetChecklistModal}
                onSubmit={onCompleteCheck}
                session={session}
            />
        </Page>
    );
};

export default Assets;
