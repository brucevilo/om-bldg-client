import {
    Page,
    DesignDetailTabs,
    AgreementDetails,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import { Contract, Design } from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';
import { ContractVersionTabs } from 'lib/Presentation/Component/ContractVersionTabs';
import { MigratedDesignContract } from '@/Presentation/Component/MigratedDesign/MigratedDesignContract';

interface Props {
    id: number;
}
interface State {
    design: Design;
    contract: Contract;
}

const useDesignContractState = (id: number) => {
    const [state, setState] = useState<State>();

    const fetchData = async () => {
        const design = await DesignRepository.get(id);
        setState({
            design,
            contract: design.latestContract,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { state, setState };
};
const DesignContract: NextPage<Props> = ({ id }) => {
    const { state, setState } = useDesignContractState(id);
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    if (!state) return null;
    const { design, contract } = state;

    return (
        <Page>
            <section>
                <DesignHeaderBreadcrumb
                    design={design}
                    displayDeleteButton={() =>
                        setDisplayDeleteButton(!displayDeleteButton)
                    }
                />
                <DesignDetailTabs
                    id={id}
                    design={design}
                    displayDeleteButton={displayDeleteButton}
                />
                <ContractVersionTabs
                    contractable={design}
                    currentContract={contract}
                    setCurrentContract={(contract: Contract) =>
                        setState({ ...state, contract })
                    }
                />
                {design.madeByMigration ? (
                    <MigratedDesignContract currentContract={contract} />
                ) : (
                    <AgreementDetails
                        contract={contract}
                        contractable={design}
                    />
                )}
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

export default DesignContract;
