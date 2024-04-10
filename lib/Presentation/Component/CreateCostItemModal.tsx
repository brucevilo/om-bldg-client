import React, { FC, useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import {
    Modal,
    ModalProps,
    ModalBody,
    FormGroup,
    Form,
    FormLabel,
    FormControl,
    Row,
    Col,
    Badge,
    Button,
} from 'react-bootstrap';
import {
    AssetStatement,
    Construction,
    CostItem,
    Price,
    Deflator,
} from '@/Domain/Entity';
import {
    ConstructionRepository,
    CostItemRepository,
    PriceRepository,
    DeflatorRepository,
} from '@/Domain/Repository';
import { DeflatorService } from '@/Domain/Service';
import { CostItemService, CreateCostItemParams } from '@/Domain/Service';
import { DateTime } from 'luxon';
import { uniqBy } from 'lodash';
import { assertsIsExists } from '@/Infrastructure';

type Props = ModalProps & {
    onHide: VoidFunction;
    checkedCostItemIds: number[];
    setCheckedCostItemIds: (ids: number[]) => void;
    costItems: CostItem[];
    setCostItems: (css: CostItem[]) => void;
    parentAssetStatement: AssetStatement | undefined;
};

interface CostItemFormParams {
    costItemName: string;
    price: Price | null;
    deflatedPrice: number | null;
    amount?: string;
}

export const CreateCostItemModal: FC<Props> = ({
    onHide,
    setCostItems,
    costItems,
    checkedCostItemIds,
    setCheckedCostItemIds,
    parentAssetStatement,
    ...modalProps
}) => {
    const [construction, setConstruction] = useState<Construction>();
    const [costItemFormParams, setCostItemFormParams] = useState<
        CostItemFormParams[]
    >([
        {
            costItemName: '',
            price: null,
            amount: '',
            deflatedPrice: null,
        },
    ]);
    const [
        costItemsWithParentAssetStatement,
        setCostItemsWithParentAssetStatement,
    ] = useState<CostItem[]>([]);
    const [prices, setPrices] = useState<Price[]>([]);
    const [deflators, setDeflators] = useState<Deflator[]>([]);
    const [
        deflatorWithParentAssetStatement,
        setDeflatorWithParentAssetStatement,
    ] = useState<Deflator>();
    const router = useRouter();

    const fetchData = async () => {
        const resConstruction = await ConstructionRepository.get(
            Number(router.query.id),
        );
        setConstruction(resConstruction);
        setPrices(await PriceRepository.list());
        setDeflators(await DeflatorRepository.list());
    };

    const fetchCostItemsWithParentAssetStatement = async () => {
        const res = await CostItemRepository.search({
            constructionId: Number(router.query.id),
            assetClassName: parentAssetStatement?.assetClass?.name,
            constructionStatementId:
                parentAssetStatement?.constructionStatementId as number,
            filterRetiremented: true,
        });
        setCostItemsWithParentAssetStatement(res.values);
    };

    const setCostItemFormParamsHelper = (
        idx: number,
        key: string,
        value: string | Price | null,
    ) => {
        const params = costItemFormParams.concat();
        params[idx] = Object.assign({}, params[idx], { [key]: value });
        setCostItemFormParams(params);
    };

    const createSubmitCostItemParams = (
        parentAssetStatement: AssetStatement,
        deflator: Deflator,
    ) => {
        const costItemParams: CreateCostItemParams[] = costItemFormParams
            .concat()
            .map(params => {
                assertsIsExists(params.price, '単価コードが選択されていません');
                const deflatedPrice = DeflatorService.calcDeflate(
                    Number(params.price?.price) * Number(params.amount),
                    deflator,
                );
                return {
                    name: params.price.name,
                    unitPrice: Number(params.price.price),
                    amount: Number(params.amount),
                    price: deflatedPrice,
                    assetClassId: parentAssetStatement.assetClass?.id as number,
                    code: params.price?.code as string,
                    constructionStatementId:
                        parentAssetStatement.constructionStatementId,
                };
            });
        return costItemParams;
    };
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!parentAssetStatement) {
            alert('親資産が選択されていません');
            return;
        }
        if (!deflatorWithParentAssetStatement) {
            alert('対象のデフレートが登録されていません');
            return;
        }
        const submitCostItemParams = createSubmitCostItemParams(
            parentAssetStatement,
            deflatorWithParentAssetStatement,
        );
        const createCostItems = await CostItemService.mStore(
            submitCostItemParams,
        );
        setCostItems(costItems.concat(createCostItems));
        setCheckedCostItemIds(
            checkedCostItemIds.concat(
                createCostItems.map(cs => cs.id as number),
            ),
        );

        alert('子資産の登録が完了しました');
        onHide();
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!parentAssetStatement) return;
        fetchCostItemsWithParentAssetStatement();
        if (!parentAssetStatement.sapRecordedAt) {
            alert('この親資産はSAPから移行されたものではありません');
            return;
        }
        const targetDeflator = deflators.find(
            d =>
                d.year ===
                DateTime.fromJSDate(parentAssetStatement.sapRecordedAt as Date)
                    .year,
        );
        if (!targetDeflator) {
            alert('対象年度のデフレーターがありません');
            return;
        }
        setDeflatorWithParentAssetStatement(targetDeflator);
    }, [parentAssetStatement]);

    return (
        <Modal size='xl' onHide={() => onHide()} {...modalProps}>
            <Modal.Header closeButton>
                <Modal.Title>詳細資産追加</Modal.Title>
            </Modal.Header>
            <ModalBody>
                <FormLabel>親資産</FormLabel>
                {parentAssetStatement ? (
                    <div>
                        <div className='bg-white p-2 m-2'>
                            <Row>
                                <Col sm={3}>{parentAssetStatement.name}</Col>
                                <Col sm={3}>{construction?.name}</Col>
                                <Col sm={3}>
                                    {parentAssetStatement.sapRecordedAt &&
                                        DateTime.fromJSDate(
                                            parentAssetStatement.sapRecordedAt,
                                        ).toFormat('yyyy/MM/dd')}
                                </Col>
                                <Col sm={3}>
                                    {parentAssetStatement.sapRecordedPrice}
                                </Col>
                            </Row>
                        </div>
                        <div className='my-2'>
                            {uniqBy(
                                costItemsWithParentAssetStatement.flatMap(
                                    ci => ci.costItemTags,
                                ),
                                'name',
                            ).map(cit => (
                                <Badge variant='primary' key={cit.id}>
                                    {cit.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                ) : null}
                <Form inline onSubmit={onSubmit}>
                    {costItemFormParams.map((params, idx) => (
                        <Row key={idx}>
                            <Col sm={2}>
                                <FormGroup className='d-flex flex-column'>
                                    <FormLabel className='mr-auto font-weight-bold'>
                                        単価コード
                                    </FormLabel>
                                    <FormControl
                                        required
                                        autoComplete='on'
                                        className='w-100'
                                        value={params.price?.code || ''}
                                        onChange={e =>
                                            setCostItemFormParamsHelper(
                                                idx,
                                                'price',
                                                prices.find(
                                                    p =>
                                                        p.code ===
                                                        e.target.value,
                                                ) || null,
                                            )
                                        }
                                        list='prices'
                                    />
                                    <datalist id='prices'>
                                        {prices.map(p => (
                                            <option key={p.id} value={p.code}>
                                                {p.code}:{p.name}
                                            </option>
                                        ))}
                                    </datalist>
                                </FormGroup>
                            </Col>
                            <Col sm={3}>
                                <FormGroup className='d-flex flex-column justify-content-start'>
                                    <FormLabel className='mr-auto font-weight-bold'>
                                        名称
                                    </FormLabel>
                                    <FormControl
                                        disabled
                                        required
                                        className='w-100'
                                        value={params.price?.name}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={2}>
                                <FormGroup className='d-flex flex-column justify-content-start'>
                                    <FormLabel className='mr-auto font-weight-bold'>
                                        単価
                                    </FormLabel>
                                    <FormControl
                                        disabled
                                        className='w-100'
                                        value={params.price?.price || ''}
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={1}>
                                <FormGroup className='d-flex flex-column justify-content-start'>
                                    <FormLabel className='mr-auto font-weight-bold'>
                                        数量
                                    </FormLabel>
                                    <FormControl
                                        className='w-100'
                                        required
                                        pattern='^\d+(\.\d+)?$'
                                        title='半角数字で入力してください'
                                        value={params.amount}
                                        onChange={e =>
                                            setCostItemFormParamsHelper(
                                                idx,
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={2}>
                                <FormGroup className='d-flex flex-column justify-content-start'>
                                    <FormLabel className='mr-auto font-weight-bold'>
                                        再調達価格
                                    </FormLabel>
                                    <FormControl
                                        className='w-100'
                                        value={
                                            Number(params.price?.price) *
                                                Number(params.amount) || ''
                                        }
                                        disabled
                                    />
                                </FormGroup>
                            </Col>
                            <Col sm={2}>
                                <FormGroup className='d-flex flex-column'>
                                    <FormLabel className='mr-auto font-weight-bold'>
                                        デフレート後
                                    </FormLabel>
                                    <FormControl
                                        className='w-100'
                                        disabled
                                        value={
                                            (deflatorWithParentAssetStatement &&
                                                DeflatorService.calcDeflate(
                                                    Number(
                                                        params.price?.price,
                                                    ) * Number(params.amount),
                                                    deflatorWithParentAssetStatement,
                                                )) ||
                                            ''
                                        }
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                    ))}
                    <div className='my-3 w-100 d-flex justify-content-between'>
                        <a
                            className='d-inline-block'
                            onClick={() =>
                                setCostItemFormParams(
                                    costItemFormParams.concat([
                                        {
                                            costItemName: '',
                                            price: null,
                                            amount: '',
                                            deflatedPrice: null,
                                        },
                                    ]),
                                )
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            行を追加する
                        </a>
                        <Button
                            type='submit'
                            className='bg-white border'
                            variant='light'
                        >
                            登録して選択済み資産に移す
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};
