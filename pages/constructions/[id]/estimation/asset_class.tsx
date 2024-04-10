import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    AssetClassGroup,
    AssetClassDivideGroup,
    EstimationTabs,
    ConstructionTabWrapper,
    ContractVersionTabs,
} from '@/Presentation/Component';
import {
    ConstructionStatement,
    AssetClass,
    Construction,
    Contract,
} from '@/Domain/Entity';
import {
    ConstructionStatementRepository,
    AssetClassRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import { AssetClassService } from '@/Domain/Service';
import { assertsIsExists } from '@/Infrastructure';
import { useRouter } from 'next/router';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';

interface Props {
    id: number;
    contractId: number | null;
}

interface State {
    contract: Contract;
    construction: Construction;
    statements: ConstructionStatement[];
    assetClasses: AssetClass[];
}

const AssetClassDivide: NextPage<Props> = ({ id, contractId }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const router = useRouter();

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        const statements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                construction.latestContract.id,
            );
        const assetClasses = await AssetClassRepository.list();
        const contract = construction.contracts.find(
            c => c.id === (contractId || construction.latestContract.id),
        );
        assertsIsExists(contract);
        setState({
            contract,
            construction,
            statements,
            assetClasses,
        });
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    const onChangeContract = async (contract: Contract) => {
        router.push(
            `/constructions/${id}/estimation/asset_class?contract_id=${contract.id}`,
        );
    };

    if (!state) return null;

    const { contract, construction, statements, assetClasses } = state;

    // 資産クラスの"項"毎に集計したテーブルのリスト
    const aggregateByKouTables =
        AssetClassService.accountItemKousAssocitingWithCostItem(statements).map(
            kou => (
                <AssetClassGroup
                    key={kou}
                    assetClasses={assetClasses.filter(
                        ac => ac.accountItemKou === kou,
                    )}
                    constructionStatements={statements}
                    accountItemKou={kou}
                />
            ),
        );

    return (
        <Page>
            <section>
                <ConstructionHeaderBreadcrumb
                    construction={construction}
                    displayDeleteButton={() =>
                        setDisplayDeleteButton(!displayDeleteButton)
                    }
                />
                <ConstructionTabWrapper
                    id={id}
                    construction={construction}
                    displayDeleteButton={displayDeleteButton}
                />
                <ContractVersionTabs
                    contractable={construction}
                    currentContract={contract}
                    setCurrentContract={onChangeContract}
                />
                <EstimationTabs constructionId={id} contractId={contract.id} />
                <AssetClassDivideGroup constructionStatements={statements} />
                {aggregateByKouTables}
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    query,
}) => {
    return {
        props: {
            id: Number(params?.id),
            contractId: query.contract_id ? Number(query.contract_id) : null,
        },
    };
};

export default AssetClassDivide;
