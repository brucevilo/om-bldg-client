import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Construction, Contract } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import { useEffect, useState } from 'react';
import {
    ConstructionTabWrapper,
    ContractVersionTabs,
    EstimationTabs,
    Page,
} from '@/Presentation/Component';
import { Card } from 'react-bootstrap';
import { assertsIsExists } from '@/Infrastructure';
import { useRouter } from 'next/router';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';

interface Props {
    id: number;
    contractId: number | null;
}

interface State {
    construction: Construction;
    contract: Contract;
}

const EstimationInfo: NextPage<Props> = ({ id, contractId }) => {
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
        setState({
            construction,
            contract,
        });
    };
    useEffect(() => {
        fetchData();
    }, [router.query]);
    if (!state) return null;

    const onChangeContract = async (contract: Contract) => {
        router.push(
            `/constructions/${id}/estimation?contract_id=${contract.id}`,
        );
    };

    const { construction, contract } = state;
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
                {ContractNextActionNumber.upload_cost_document >=
                ContractNextActionNumber[contract.nextAction] ? (
                    <>
                        <Card>
                            <Card.Body>
                                <div className='d-flex justify-content-between'>
                                    <span>積算が登録されていません</span>
                                </div>
                            </Card.Body>
                        </Card>
                    </>
                ) : (
                    <>
                        <Card>
                            <Card.Body>
                                <h5 className='font-weight-bold mb-4'>
                                    積算登録済みです
                                </h5>
                            </Card.Body>
                        </Card>
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

export default EstimationInfo;
