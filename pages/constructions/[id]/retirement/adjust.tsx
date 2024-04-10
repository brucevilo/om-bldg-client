import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { NextPage, GetServerSideProps } from 'next';
import { flatten } from 'lodash';
import {
    Modal,
    ModalTitle,
    ModalBody,
    Table,
    FormControl,
    Form,
    Button,
} from 'react-bootstrap';
import {
    CostItemRepository,
    AssetStatementRepository,
    RetirementCostItemRepository,
} from '@/Domain/Repository';
import { CostItem, AssetStatement, RetirementCostItem } from '@/Domain/Entity';
import { StoredRetirementParams, RetirementService } from '@/Domain/Service';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';

interface Props {
    id: number;
    costItemIds: number[];
    constructionStatementId: number | null;
}

interface EditRetirementParams {
    costItem: CostItem;
    amount: string;
    assetStatement: AssetStatement;
}

const AdjustTr = (props: {
    editRetirementParams: EditRetirementParams;
    editRetirementParamsArray: EditRetirementParams[];
    setEditRetirementParamsArray: React.Dispatch<
        React.SetStateAction<EditRetirementParams[]>
    >;
    retirementCostItems: RetirementCostItem[];
}) => {
    const {
        editRetirementParams,
        editRetirementParamsArray,
        setEditRetirementParamsArray,
        retirementCostItems,
    } = props;
    const costItemId = editRetirementParams.costItem.id;
    assertsIsNotNull(costItemId, 'システム上の資産明細にIDがありません');

    const onAmountChange = (costItemId: number, amount: string) => {
        const newEditRetirementparamsArray = editRetirementParamsArray.map(
            params => {
                if (params.costItem.id !== costItemId) return params;

                return {
                    ...params,
                    amount,
                };
            },
        );
        setEditRetirementParamsArray(newEditRetirementparamsArray);
    };

    return (
        <tr key={costItemId}>
            <td>{editRetirementParams.costItem.name}</td>
            <td>
                {RetirementService.calcRetirementedRemainCostItemAmount(
                    editRetirementParams.costItem,
                    retirementCostItems,
                )}
            </td>
            <td>
                <FormControl
                    required
                    disabled={!editRetirementParams.assetStatement.isPrivatized}
                    pattern='^([1-9]\d*|0)(\.\d+)?$'
                    title='数値を入力してください'
                    value={
                        editRetirementParams.assetStatement.isPrivatized
                            ? editRetirementParams.amount
                            : editRetirementParams.costItem.amount || ''
                    }
                    onChange={e => onAmountChange(costItemId, e.target.value)}
                />
            </td>
            <td>{editRetirementParams.assetStatement.name}</td>
        </tr>
    );
};

const AdjustRetirement: NextPage<Props> = ({
    id,
    costItemIds,
    constructionStatementId,
}) => {
    const [editRetirementParamsArray, setEditRetirementParamsArray] = useState<
        EditRetirementParams[]
    >([]);
    const [retirementCostItems, setRetirementCostItems] = useState<
        RetirementCostItem[]
    >([]);
    const router = useRouter();
    const fetchData = async () => {
        const costItems = await CostItemRepository.mget(costItemIds);
        const assetStatements = await AssetStatementRepository.list();

        setEditRetirementParamsArray(
            costItems.map(ci => {
                // @TODO 特定情報 AssetStatementとcostItemの紐付けに特定情報を使用する変更に伴い修正が必要？
                const targetAssetStatement = assetStatements.find(as => {
                    if (!as.assetClass || !ci.assetClass) return false;
                    return (
                        as.assetClass?.id === ci.assetClass?.id &&
                        as.constructionStatementId ===
                            ci.constructionStatementId
                    );
                });

                assertsIsExists(
                    targetAssetStatement,
                    '資産明細に紐づく、資産がありません',
                );

                return {
                    costItem: ci,
                    amount: targetAssetStatement.isPrivatized
                        ? ''
                        : ci.amount.toString(),
                    assetStatement: targetAssetStatement,
                };
            }),
        );
        setRetirementCostItems(
            await RetirementCostItemRepository.mgetByCostItems(costItems),
        );
    };

    const onAdjustComplete = (e: FormEvent) => {
        e.preventDefault();
        if (
            editRetirementParamsArray.some(ra => {
                return (
                    RetirementService.calcRetirementedRemainCostItemAmount(
                        ra.costItem,
                        retirementCostItems,
                    ) -
                        Number(ra.amount) <
                    0
                );
            })
        ) {
            alert('入力した数量が除却元の数量を上回っています');
            return;
        }
        localStorage.setItem(
            'retirementParams',
            JSON.stringify(
                editRetirementParamsArray.map<StoredRetirementParams>(ra => ({
                    amount: Number(ra.amount),
                    costItemId: ra.costItem.id as number,
                    assetStatementId: ra.assetStatement.id as number,
                })),
            ),
        );
        router.push(
            `/constructions/${id}/retirement/confirm${
                constructionStatementId
                    ? '?constructionStatementId=' + constructionStatementId
                    : ''
            }`,
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Modal size='xl' show onHide={() => void 0}>
            <Modal.Header>
                <ModalTitle style={{ fontSize: '16px' }}>数量の指定</ModalTitle>
            </Modal.Header>
            <ModalBody>
                <Form onSubmit={onAdjustComplete}>
                    <Table>
                        <thead>
                            <tr>
                                <th>子資産</th>
                                <th>現在数量</th>
                                <th>除却数量</th>
                                <th>親資産</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editRetirementParamsArray.map(
                                editRetirementParams => (
                                    <AdjustTr
                                        key={editRetirementParams.costItem.id}
                                        editRetirementParams={
                                            editRetirementParams
                                        }
                                        editRetirementParamsArray={
                                            editRetirementParamsArray
                                        }
                                        retirementCostItems={
                                            retirementCostItems
                                        }
                                        setEditRetirementParamsArray={
                                            setEditRetirementParamsArray
                                        }
                                    />
                                ),
                            )}
                        </tbody>
                    </Table>
                    <div className='text-right'>
                        <Button
                            type='submit'
                            variant='light'
                            className='bg-white border'
                        >
                            確定する
                        </Button>
                    </div>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    query,
}) => {
    assertsIsExists(params, 'paramsがありません');
    assertsIsExists(query, 'queryがありません');
    assertsIsExists(query.costItemIds, '資産明細が選択されていません');
    const costItemIds = flatten([query.costItemIds]).map(s => Number(s));
    return {
        props: {
            id: Number(params.id),
            constructionStatementId: query.constructionStatementId
                ? Number(query.constructionStatementId)
                : null,
            costItemIds,
        },
    };
};

export default AdjustRetirement;
