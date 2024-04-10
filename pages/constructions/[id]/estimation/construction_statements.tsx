import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { ConstructionStatement, Construction, Contract } from '@/Domain/Entity';
import {
    ConstructionStatementRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import {
    Page,
    EstimationTabs,
    ConstructionTabWrapper,
    ContractVersionTabs,
    // UploadEstimationSheetButtonWithModal,
} from '@/Presentation/Component';
import { ConstructionStatementSheet } from '@/Presentation/Component';
import { assertsIsExists } from '@/Infrastructure';
import { useRouter } from 'next/router';
import { Card } from 'react-bootstrap';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';
import { MigratedConstructionEstimation } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionEstimation';

interface Props {
    id: number;
    contractId: number | null;
}

interface State {
    contract: Contract;
    construction: Construction;
    constructionStatements: ConstructionStatement[];
}

const ConstructionStatements: NextPage<Props> = ({ id, contractId }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const router = useRouter();

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        const contract = construction.contracts.find(
            c => c.id === (contractId || construction.latestContract.id),
        );
        assertsIsExists(contract);
        const constructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                contract.id,
            );
        setState({
            construction,
            constructionStatements,
            contract,
        });
    };

    const onChangeContract = async (contract: Contract) => {
        router.push(
            `/constructions/${id}/estimation/construction_statements?contract_id=${contract.id}`,
        );
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    if (!state) return null;

    const { construction, constructionStatements, contract } = state;

    if (construction.madeByMigration) {
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
                    <MigratedConstructionEstimation />
                </section>
            </Page>
        );
    }

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
                {ContractNextActionNumber.upload_cost_document <
                    ContractNextActionNumber[contract.nextAction] && (
                    <EstimationTabs
                        constructionId={id}
                        contractId={contract.id}
                    />
                )}
                {ContractNextActionNumber[contract.nextAction] <=
                ContractNextActionNumber.upload_cost_document ? (
                    <>
                        <Card>
                            <Card.Body>
                                <div className='d-flex justify-content-between'>
                                    <span>
                                        内訳書が登録されていません。先に前のプロセスを行ってください。
                                    </span>
                                </div>
                            </Card.Body>
                        </Card>
                    </>
                ) : (
                    <>
                        {constructionStatements.map((cs, index) => (
                            <ConstructionStatementSheet
                                key={index}
                                sheet={cs}
                            />
                        ))}
                    </>
                )}
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

export default ConstructionStatements;
