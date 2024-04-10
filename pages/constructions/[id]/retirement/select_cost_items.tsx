import React, { useEffect, useState, FormEvent } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import {
    Loading,
    Page,
    PagingButtons,
    CreateCostItemModal,
} from '@/Presentation/Component';
import { AssetStatement, Construction, CostItem } from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
    RetirementRepository,
} from '@/Domain/Repository';
import { Form, Tabs, Tab } from 'react-bootstrap';
import { CostItemRepository } from '@/Domain/Repository';
import { xor, flatten } from 'lodash';
import { Table, Badge, Button, Navbar, Nav, Card, Col } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { map, uniqBy } from 'lodash';
import { RetirementService } from '@/Domain/Service';
import { assertsIsExists } from '@/Infrastructure';
import Link from 'next/link';
import { SearchAssetStatementModal } from '@/Presentation/Component/SearchAssetStatementModal';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

type Props = {
    id: number;
    constructionStatementId: number;
    tagNames: string[];
    costItemNames: string[];
    constructionNames: string[];
    costItemIds: number[];
};

const SelectCostItemsRetirement: NextPage<Props> = ({
    id,
    tagNames,
    costItemNames,
    constructionNames,
    constructionStatementId,
    costItemIds,
}) => {
    const [construction, setConstruction] = useState<Construction>();
    const [costItems, setCostItems] = useState<CostItem[]>([]);
    const [searchTagName, setSearchTagName] = useState<string>(
        tagNames.join(' '),
    );
    const [searchCostItemName, setSearchCostItemName] = useState<string>(
        costItemNames.join(' '),
    );
    const [searchConstructionName, setSearchConstructionName] =
        useState<string>(constructionNames.join(' '));
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [checkedCostItemIds, setCheckedCostItemIds] =
        useState<number[]>(costItemIds);
    const [searchAssetStatementModal, setSearchAssetStatementModal] =
        useState<boolean>(false);
    const [parentAssetStatement, setParentAssetStatement] =
        useState<AssetStatement>();
    const [
        constructionStatementIdsWithConstruction,
        setConstructionStatementIdsWithConstruction,
    ] = useState<[number, Construction][]>([]);
    const [sapRecordedAtStartAt, setSapRecordedAtStartAt] =
        useState<string>('');
    const [sapRecordedAtEndAt, setSapRecordedAtEndAt] = useState<string>('');
    const [assetStatements, setAssetStatements] = useState<AssetStatement[]>();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const fetchData = async () => {
        setConstruction(await ConstructionRepository.get(id));
    };

    const searchData = async () => {
        setIsLoading(true);
        const fetchData = await CostItemRepository.search({
            tagNames,
            costItemNames,
            isAsset: true,
            filterRetiremented: true,
            page: currentPage,
            sapRecordedAtStartAt:
                sapRecordedAtStartAt &&
                DateTime.fromFormat(sapRecordedAtStartAt, 'yyyy-MM-dd')
                    .startOf('day')
                    .toISO(),
            sapRecordedAtEndAt:
                sapRecordedAtEndAt &&
                DateTime.fromFormat(sapRecordedAtEndAt, 'yyyy-MM-dd')
                    .endOf('day')
                    .toISO(),
            constructionName: searchConstructionName,
            isLatestContract: true,
        });
        assertsIsExists(fetchData.totalPages, 'ページ数が取得できていません');
        setTotalPages(fetchData.totalPages);
        const checkedCostItems = await CostItemRepository.mget(
            checkedCostItemIds,
        );
        const costItems = uniqBy(
            fetchData.values.concat(checkedCostItems),
            'id',
        );
        setCostItems(costItems);
        const constructionStatementIds = uniqBy(
            costItems,
            'constructionStatementId',
        ).map(ci => ci.constructionStatementId);
        const constructionStatements =
            await ConstructionStatementRepository.mget(
                constructionStatementIds as number[],
            );
        const contractIds = uniqBy(constructionStatements, 'contractId').map(
            cs => cs.contractId,
        );
        const constructions = await ConstructionRepository.mgetByContracts(
            contractIds,
        );
        const constructionStatementIdsWithConstruction =
            constructionStatements.map(constructionStatement => {
                const construction = constructions.find(
                    c => c.contracts[0].id === constructionStatement.contractId,
                );
                return [constructionStatement.id, construction] as [
                    number,
                    Construction,
                ];
            });
        setConstructionStatementIdsWithConstruction(
            constructionStatementIdsWithConstruction,
        );
        setAssetStatements(
            await AssetStatementRepository.mgetByConstructionStatements(
                constructionStatementIds as number[],
            ),
        );
        setIsLoading(false);
    };

    const appendUrlSearchParams = (
        tagName?: string,
        costItemName?: string,
        constructionName?: string,
    ): URLSearchParams => {
        const urlSearchParams = new URLSearchParams();
        if (tagName) {
            tagName.split(' ').forEach(t => {
                urlSearchParams.append('tagName', t);
            });
        }
        if (costItemName) {
            costItemName.split(' ').forEach(ci => {
                urlSearchParams.append('costItemName', ci);
            });
        }
        if (constructionName) {
            constructionName.split(' ').forEach(c => {
                urlSearchParams.append('constructionName', c);
            });
        }
        checkedCostItemIds.forEach(id => {
            urlSearchParams.append('costItemIds', id.toString());
        });
        return urlSearchParams;
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const urlSearchParams = appendUrlSearchParams(
            searchTagName,
            searchCostItemName,
            searchConstructionName,
        );
        router.push(
            `/constructions/${id}/retirement/select_cost_items?constructionStatementId=${constructionStatementId}&${urlSearchParams.toString()}`,
        );
    };

    const onSpecifiedRetirement = async () => {
        const assetStatements =
            await AssetStatementRepository.mgetByCostItemIds(
                checkedCostItemIds,
            );
        const isEmptySapRecordedAt = assetStatements.filter(
            assetStatement => !assetStatement.sapRecordedAt,
        );
        if (isEmptySapRecordedAt.length !== 0) {
            return alert(
                'sap固定資産台帳との紐付けが済んでいない資産を除却しようとしています',
            );
        }
        const urlSearchParams = appendUrlSearchParams();
        router.push(
            `/constructions/${id}/retirement/adjust?constructionStatementId=${constructionStatementId}&${urlSearchParams.toString()}`,
        );
    };

    const onNothingRetirementAsset = async () => {
        await RetirementRepository.create(
            RetirementService.buildRetirementCreateRequest(
                constructionStatementId,
            ),
            id,
        );
        alert('工事を除却済みにしました');
        router.push(`/constructions/${id}/summary`);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        searchData();
    }, [tagNames, costItemNames, currentPage]);

    if (!construction) return null;

    const onFilterSearchParams = (searchParam: string) => {
        if (searchTagName === searchParam) {
            setSearchTagName('');
            const urlSearchParams = appendUrlSearchParams(
                '',
                searchCostItemName,
                searchConstructionName,
            );
            router.push(
                `/constructions/${id}/retirement/select_cost_items?constructionStatementId=${constructionStatementId}&${urlSearchParams.toString()}`,
            );
        } else if (searchCostItemName === searchParam) {
            setSearchCostItemName('');
            const urlSearchParams = appendUrlSearchParams(
                searchTagName,
                '',
                searchConstructionName,
            );
            router.push(
                `/constructions/${id}/retirement/select_cost_items?constructionStatementId=${constructionStatementId}&${urlSearchParams.toString()}`,
            );
        } else {
            setSearchConstructionName('');
            const urlSearchParams = appendUrlSearchParams(
                searchTagName,
                searchCostItemName,
                '',
            );
            router.push(
                `/constructions/${id}/retirement/select_cost_items?constructionStatementId=${constructionStatementId}&${urlSearchParams.toString()}`,
            );
        }
    };

    const SearchedCostItemTr = (props: { costItem: CostItem }) => {
        const { costItem } = props;
        return (
            <tr key={costItem.id}>
                <td>
                    {
                        <Form.Check
                            checked={
                                !!checkedCostItemIds.find(
                                    id => id === costItem.id,
                                )
                            }
                            onChange={() =>
                                setCheckedCostItemIds(
                                    xor(checkedCostItemIds, [
                                        costItem.id as number,
                                    ]),
                                )
                            }
                        />
                    }
                </td>
                <td>{costItem.id}</td>
                <td>
                    {costItem.costItemTags.map(tag => (
                        <Badge
                            variant='primary'
                            key={costItem.id + '-' + tag.id}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                </td>
                <td title={costItem.name}>{costItem.name}</td>
                <td>
                    {(() => {
                        const constructionStatementIdWithConstruction =
                            constructionStatementIdsWithConstruction.find(
                                cs =>
                                    cs[0] === costItem.constructionStatementId,
                            );
                        if (!constructionStatementIdWithConstruction) return '';
                        return constructionStatementIdWithConstruction[1].name;
                    })()}
                </td>
                <td>
                    {(() => {
                        const assetStatement = assetStatements?.find(
                            assetStatement =>
                                assetStatement.constructionStatementId ===
                                    costItem.constructionStatementId &&
                                assetStatement.assetClass?.id ===
                                    costItem.assetClass?.id,
                        );
                        return assetStatement?.sapRecordedAt
                            ? DateTime.fromJSDate(
                                  assetStatement.sapRecordedAt,
                              ).toFormat('yyyy/MM/dd')
                            : '';
                    })()}
                </td>
                <td>{costItem.price}</td>
            </tr>
        );
    };

    const CheckedCostItemTr = (props: { costItem: CostItem }) => {
        const { costItem } = props;
        return (
            <tr key={`check-${costItem.id}`}>
                <td>
                    {
                        <Form.Check
                            checked={
                                !!checkedCostItemIds.find(
                                    id => id === costItem.id,
                                )
                            }
                            onChange={() =>
                                setCheckedCostItemIds(
                                    xor(checkedCostItemIds, [
                                        costItem.id as number,
                                    ]),
                                )
                            }
                        />
                    }
                </td>
                <td>{costItem.id}</td>
                <td>
                    {costItem.costItemTags.map(tag => (
                        <Badge variant='primary' key={tag.id}>
                            {tag.name}
                        </Badge>
                    ))}
                </td>
                <td title={costItem.name}>{costItem.name}</td>
                <td>
                    {(() => {
                        const constructionStatementIdWithConstruction =
                            constructionStatementIdsWithConstruction.find(
                                cs =>
                                    cs[0] === costItem.constructionStatementId,
                            );
                        if (!constructionStatementIdWithConstruction) return '';
                        return constructionStatementIdWithConstruction[1].name;
                    })()}
                </td>
                <td>
                    {DateTime.fromJSDate(costItem.createdAt).toFormat(
                        'yyyy/MM/dd',
                    )}
                </td>
                <td>{costItem.price}</td>
            </tr>
        );
    };

    return (
        <Page className='position-relative'>
            <Navbar bg='white' className='px-5'>
                <Link href={`/constructions/${id}/summary`} passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>除却</span>
                        <small className='text-secondary'>
                            {construction.name}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <p className='font-weight-bold mb-4'>
                    除却対象資産を選択してください
                </p>
                <Card className='mb-4'>
                    <Card.Body>
                        <Form onSubmit={e => onSubmit(e)}>
                            <Form.Label>取得日</Form.Label>
                            <Form.Row className='align-items-center mb-4'>
                                <Col xs='auto'>
                                    <Form.Control
                                        type='date'
                                        value={sapRecordedAtStartAt || ''}
                                        onChange={e =>
                                            setSapRecordedAtStartAt(
                                                e.target.value,
                                            )
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
                                        value={sapRecordedAtEndAt || ''}
                                        onChange={e =>
                                            setSapRecordedAtEndAt(
                                                e.target.value,
                                            )
                                        }
                                        max='3000-12-31'
                                    />
                                </Col>
                                <Col xs='auto'>
                                    <Button
                                        variant='light'
                                        className='border bg-white'
                                        onClick={() => {
                                            setSapRecordedAtStartAt('');
                                            setSapRecordedAtEndAt('');
                                        }}
                                    >
                                        クリア
                                    </Button>
                                </Col>
                            </Form.Row>
                            <Form.Row className='align-items-end'>
                                <Form.Group as={Col}>
                                    <Form.Label>特定情報</Form.Label>
                                    <Form.Control
                                        value={searchTagName}
                                        onChange={e =>
                                            setSearchTagName(e.target.value)
                                        }
                                        placeholder='特定情報を入力して下さい。'
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>子資産名</Form.Label>
                                    <Form.Control
                                        value={searchCostItemName}
                                        onChange={e =>
                                            setSearchCostItemName(
                                                e.target.value,
                                            )
                                        }
                                        placeholder='子資産名を入力してください。'
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Form.Label>工事名</Form.Label>
                                    <Form.Control
                                        value={searchConstructionName}
                                        onChange={e =>
                                            setSearchConstructionName(
                                                e.target.value,
                                            )
                                        }
                                        placeholder='工事名を入力してください。'
                                    />
                                </Form.Group>
                                <Form.Group as={Col}>
                                    <Button
                                        id='submit'
                                        type='submit'
                                        variant='light'
                                        className='bg-white border'
                                    >
                                        送信
                                    </Button>
                                </Form.Group>
                            </Form.Row>
                        </Form>
                    </Card.Body>
                </Card>
                {[searchTagName, searchCostItemName, searchConstructionName]
                    .filter(searchName => !!searchName)
                    .map(searchName => (
                        <Badge
                            key={searchName}
                            variant='info'
                            className='mr-2 mb-2'
                        >
                            <span
                                aria-hidden='true'
                                onClick={() => onFilterSearchParams(searchName)}
                                style={{ cursor: 'pointer' }}
                                className='mr-1'
                            >
                                <FA icon={faTimesCircle} />
                            </span>
                            {searchName}
                        </Badge>
                    ))}
                <Tabs
                    defaultActiveKey='searched'
                    transition={false}
                    className='mb-4'
                >
                    <Tab eventKey='searched' title='検索結果'>
                        <Table hover className='mb-4'>
                            <thead>
                                <tr>
                                    <td style={{ width: '40px' }}>
                                        <Form.Check checked={true} readOnly />
                                    </td>
                                    <td style={{ width: '120px' }}>ID</td>
                                    <td>特定情報</td>
                                    <td>詳細資産情報</td>
                                    <td>工事名称</td>
                                    <td style={{ width: '124px' }}>取得日</td>
                                    <td style={{ width: '160px' }}>金額</td>
                                </tr>
                            </thead>
                            {isLoading ? (
                                <tbody>
                                    <tr>
                                        <td>
                                            <Loading zIndex={1} left={220} />
                                        </td>
                                    </tr>
                                </tbody>
                            ) : (
                                <tbody>
                                    {costItems
                                        .filter(
                                            ci =>
                                                !checkedCostItemIds.includes(
                                                    ci.id as number,
                                                ),
                                        )
                                        .map(costItem => (
                                            <SearchedCostItemTr
                                                key={costItem.id as number}
                                                costItem={costItem}
                                            />
                                        ))}
                                </tbody>
                            )}
                        </Table>

                        <div className='d-flex justify-content-between'>
                            <PagingButtons
                                page={currentPage}
                                totalPages={totalPages}
                                onChangePage={i => setCurrentPage(i)}
                            />
                            <div>
                                <Button
                                    disabled={currentPage < 2}
                                    onClick={() =>
                                        setCurrentPage(currentPage - 1)
                                    }
                                    className='mr-2 bg-white border'
                                    variant={'light'}
                                >
                                    前のページへ
                                </Button>
                                <Button
                                    disabled={totalPages <= currentPage}
                                    onClick={() =>
                                        setCurrentPage(currentPage + 1)
                                    }
                                    className='bg-white border'
                                    variant={'light'}
                                >
                                    次のページへ
                                </Button>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey='selected' title='選択済み資産'>
                        <Table hover className='mb-4'>
                            <thead>
                                <tr>
                                    <td style={{ width: '40px' }}>
                                        <Form.Check checked={true} readOnly />
                                    </td>
                                    <td style={{ width: '120px' }}>ID</td>
                                    <td>特定情報</td>
                                    <td>詳細資産情報</td>
                                    <td>工事名称</td>
                                    <td style={{ width: '124px' }}>取得日</td>
                                    <td style={{ width: '160px' }}>金額</td>
                                </tr>
                            </thead>
                            <tbody>
                                {costItems
                                    .filter(ci =>
                                        checkedCostItemIds.includes(
                                            ci.id as number,
                                        ),
                                    )
                                    .map(costItem => (
                                        <CheckedCostItemTr
                                            key={costItem.id as number}
                                            costItem={costItem}
                                        />
                                    ))}
                            </tbody>
                        </Table>
                    </Tab>
                </Tabs>
            </section>
            <div
                className='d-flex justify-content-between align-items-center position-sticky px-5 py-3 bg-white'
                style={{ bottom: '0' }}
            >
                <a
                    onClick={() => setSearchAssetStatementModal(true)}
                    className='text-decoration-none'
                    style={{ cursor: 'pointer' }}
                >
                    資産を追加する
                </a>
                <div>
                    <Button
                        className='mr-2 bg-white border'
                        variant='light'
                        disabled={checkedCostItemIds.length !== 0}
                        onClick={() => onNothingRetirementAsset()}
                    >
                        除却資産なし
                    </Button>
                    <Button
                        className='bg-white border'
                        variant='light'
                        disabled={checkedCostItemIds.length === 0}
                        onClick={() => onSpecifiedRetirement()}
                    >
                        資産を特定する
                    </Button>
                </div>
            </div>
            <CreateCostItemModal
                show={showModal}
                onHide={() => setShowModal(false)}
                checkedCostItemIds={checkedCostItemIds}
                setCheckedCostItemIds={(ids: number[]) =>
                    setCheckedCostItemIds(ids)
                }
                costItems={costItems}
                setCostItems={(css: CostItem[]) => setCostItems(css)}
                parentAssetStatement={parentAssetStatement}
            />
            <SearchAssetStatementModal
                show={searchAssetStatementModal}
                onHide={() => setSearchAssetStatementModal(false)}
                setShowModal={() => setShowModal(true)}
                parentAssetStatement={parentAssetStatement}
                setParentAssetStatement={setParentAssetStatement}
            />
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    query,
}) => {
    assertsIsExists(params, 'paramsがありません');
    assertsIsExists(query, 'queryがありません');
    const tagNames = query.tagName ? flatten([query.tagName]) : [];
    const costItemNames = query.costItemName
        ? flatten([query.costItemName])
        : [];
    const constructionNames = query.constructionName
        ? flatten([query.constructionName])
        : [];
    const costItemIds = query.costItemId
        ? map(flatten([query.costItemId]), id => Number(id))
        : [];

    return {
        props: {
            id: Number(params?.id),
            constructionStatementId: Number(query?.constructionStatementId),
            tagNames,
            costItemNames,
            constructionNames,
            costItemIds,
        },
    };
};

export default SelectCostItemsRetirement;
