import React, { useEffect, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Construction, Contract, RetirementCostItem } from '@/Domain/Entity';
import {
    CostItemRepository,
    AssetStatementRepository,
    ConstructionRepository,
    RetirementCostItemRepository,
} from '@/Domain/Repository';
import { Page } from '@/Presentation/Component';
import { Button, Form, FormGroup, Navbar, Nav } from 'react-bootstrap';
import { groupBy } from 'lodash';
import { RetirementRepository } from '@/Domain/Repository';
import { RetirementService, RetirementCreateParams } from '@/Domain/Service';
import { StoredRetirementParams } from '@/Domain/Service';
import { assertsIsExists } from '@/Infrastructure';
import { ConfirmRetirementCard } from '@/Presentation/Component';
import Link from 'next/link';

interface Props {
    id: number;
    constructionStatementId: number | null;
}

const ConfirmRetirement: NextPage<Props> = ({
    id,
    constructionStatementId,
}) => {
    const [construction, setConstruction] = useState<Construction>();
    const [retirementCreateParamsList, setRetirementCreateParamsList] =
        useState<RetirementCreateParams[]>([]);
    const [contract, setContract] = useState<Contract>();
    const [retirementedAt, setRetirementedAt] = useState<string>('');
    const [retirementCostItems, setRetirementCostItems] = useState<
        RetirementCostItem[]
    >([]);
    const router = useRouter();

    const fetchData = async () => {
        const storedRetirementParamsString =
            localStorage.getItem('retirementParams');
        if (!storedRetirementParamsString) {
            alert('除却情報が保存されていません');
            router.push('/constructions');
            return;
        }
        const storedRetirementParams: StoredRetirementParams[] = JSON.parse(
            storedRetirementParamsString,
        );
        const costItemIds: number[] = storedRetirementParams.map(
            ra => ra.costItemId,
        );
        const costItems = await CostItemRepository.mget(costItemIds);

        const construction = await ConstructionRepository.get(id);
        setConstruction(construction);
        setContract(construction.latestContract);
        const assetStatements = await AssetStatementRepository.list();

        setRetirementCreateParamsList(
            storedRetirementParams.map(ra => {
                const costItem = costItems.find(ci => ci.id === ra.costItemId);
                assertsIsExists(costItem, '対象の子資産がありません。');
                const assetStatement = assetStatements.find(
                    as =>
                        as.constructionStatementId ===
                            costItems.find(ci => ci.id === ra.costItemId)
                                ?.constructionStatementId &&
                        as.assetClass?.name ===
                            costItems.find(ci => ci.id === ra.costItemId)
                                ?.assetClass?.name,
                );
                assertsIsExists(
                    assetStatement,
                    '資産明細に紐づく資産がありません',
                );
                return {
                    ...ra,
                    costItem,
                    assetStatement,
                };
            }),
        );

        setRetirementCostItems(
            await RetirementCostItemRepository.mgetByCostItems(costItems),
        );
    };

    const onRetirement = async (e: React.FormEvent) => {
        e.preventDefault();
        assertsIsExists(contract, 'contractがありません');
        try {
            await RetirementRepository.create(
                RetirementService.buildRetirementCreateRequest(
                    constructionStatementId,
                    retirementedAt,
                    retirementCreateParamsList,
                    contract?.rate as number,
                ),
                id,
            );
            localStorage.removeItem('retirementParams');
            alert('除却が完了しました');
            router.push('/constructions');
        } catch {
            alert('除却に失敗しました');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!construction) return null;

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href='/constructions' passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>除却</span>
                        <small className='text-secondary'>
                            {construction?.name || ''})
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <div
                    className='border border-danger rounded bg-white p-3 text-danger font-weight-bold mb-4'
                    style={{ borderStyle: 'bold' }}
                >
                    以下の資産を除却します。本当によろしいですか？
                </div>

                {Object.values(
                    groupBy(
                        retirementCreateParamsList,
                        params => params.assetStatement.id,
                    ),
                ).map(retirementCreateParamsGroupByAssetStatement => (
                    <ConfirmRetirementCard
                        key={
                            retirementCreateParamsGroupByAssetStatement[0]
                                .assetStatement.id as number
                        }
                        retirementCreateParamsGroupByAssetStatement={
                            retirementCreateParamsGroupByAssetStatement
                        }
                        construction={construction}
                        retirementCostItems={retirementCostItems}
                    />
                ))}
                <Form onSubmit={onRetirement}>
                    <FormGroup>
                        <Form.Label>除却日付の入力</Form.Label>
                        <input
                            required
                            className='form-control'
                            type='date'
                            onChange={e => setRetirementedAt(e.target.value)}
                            value={retirementedAt}
                        />
                    </FormGroup>
                    <div className='text-right'>
                        <Button type='submit' variant='outline-dark'>
                            除却を行う
                        </Button>
                    </div>
                </Form>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    query,
}) => {
    assertsIsExists(params, 'paramsがありません');
    assertsIsExists(query, 'queryがありません');
    return {
        props: {
            id: Number(params.id),
            constructionStatementId: query.constructionStatementId
                ? Number(query.constructionStatementId)
                : null,
        },
    };
};

export default ConfirmRetirement;
