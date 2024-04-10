import {
    Page,
    ConstructionTabWrapper,
    ContractVersionTabs,
    ContractInqiryDetails,
    ConstructionActionButton,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import { Construction, Contract } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import { Card } from 'react-bootstrap';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';
import { MigratedConstructionContractInquiry } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionContractInquiry';

interface Props {
    id: number;
}
interface State {
    construction: Construction;
    contract: Contract;
}

const ConstructionContractInquiry: NextPage<Props> = ({ id }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        setState({
            construction,
            contract: construction.latestContract,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!state) return null;

    const onChangeContract = (contract: Contract) => {
        setState({ ...state, contract });
    };

    const { construction, contract } = state;

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
                    <MigratedConstructionContractInquiry />
                </section>
            </Page>
        );
    }

    if (
        ContractNextActionNumber[contract.nextAction] <
        ContractNextActionNumber.agreement
    )
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
                        setCurrentContract={c => onChangeContract(c)}
                    />
                    <Card>
                        <Card.Body>
                            <div className='d-flex justify-content-between'>
                                {ContractNextActionNumber[
                                    contract.nextAction
                                ] === ContractNextActionNumber.inquiry ? (
                                    <>
                                        <span>
                                            契約伺いが登録されていません
                                        </span>
                                        <ConstructionActionButton
                                            construction={construction}
                                        />
                                    </>
                                ) : (
                                    <span>
                                        設計書・稟議が登録されていません。先に前のプロセスを行ってください。
                                    </span>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </section>
            </Page>
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
                    setCurrentContract={c => onChangeContract(c)}
                />
                <ContractInqiryDetails contract={contract} />
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            id: Number(params?.id),
        },
    };
};

export default ConstructionContractInquiry;
