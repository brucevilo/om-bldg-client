import {
    Page,
    ConstructionTabWrapper,
    ContractVersionTabs,
    AgreementDetails,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import { Construction, Contract } from '@/Domain/Entity';
import { ConstructionRepository } from '@/Domain/Repository';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { MigratedConstructionContract } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionContract';

interface Props {
    id: number;
}
interface State {
    construction: Construction;
    contract: Contract;
}

const ConstructionContract: NextPage<Props> = ({ id }) => {
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
                    <ContractVersionTabs
                        contractable={construction}
                        currentContract={contract}
                        setCurrentContract={c => onChangeContract(c)}
                    />
                    <MigratedConstructionContract
                        currentContract={state.contract}
                    />
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
                    setCurrentContract={c => onChangeContract(c)}
                />
                <AgreementDetails
                    contract={contract}
                    contractable={construction}
                    id={id}
                />
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

export default ConstructionContract;
