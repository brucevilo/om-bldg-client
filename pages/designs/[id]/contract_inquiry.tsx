import {
    Page,
    DesignDetailTabs,
    ContractVersionTabs,
    ContractInqiryDetails,
    DesignActionButton,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import { Contract, Design } from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';
import { Card } from 'react-bootstrap';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';
import { MigratedDesignContractInquiry } from '@/Presentation/Component/MigratedDesign/MigratedDesignContractInquiry';

interface Props {
    id: number;
}
interface State {
    design: Design;
    contract: Contract;
}

const DesignContractInquiry: NextPage<Props> = ({ id }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

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

    if (!state) return null;

    const onChangeContract = (contract: Contract) => {
        setState({ ...state, contract });
    };

    const { design, contract } = state;

    if (design.madeByMigration) {
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
                    <MigratedDesignContractInquiry />
                </section>
            </Page>
        );
    }

    if (!contract.inquiryAt)
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
                        setCurrentContract={c => onChangeContract(c)}
                    />
                    <Card>
                        <Card.Body>
                            <div className='d-flex justify-content-between'>
                                {contract.approvalFileInfo ? (
                                    <>
                                        <span>
                                            契約伺いが登録されていません
                                        </span>
                                        <DesignActionButton design={design} />
                                    </>
                                ) : (
                                    <span>
                                        仕様書・稟議が登録されていません。先に前のプロセスを行ってください。
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

export default DesignContractInquiry;
