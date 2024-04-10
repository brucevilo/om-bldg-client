import React, { useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
    ConstructionTabWrapper,
    ContractVersionTabs,
    Page,
    UploadDesignDocumentButtonWithModal,
} from '@/Presentation/Component';
import { ConstructionRepository } from '@/Domain/Repository';
import { Construction, Contract } from '@/Domain/Entity';
import { Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { MigratedConstructionDocument } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionDocument';

interface Props {
    id: number;
}

interface State {
    construction: Construction;
    contract: Contract;
    showModal: boolean;
}

const ConstructionDocuments: NextPage<Props> = ({ id }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        setState({
            construction: construction,
            contract: construction.latestContract,
            showModal: false,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);
    if (!state) return null;

    const { construction, contract, showModal } = state;

    const isLatest = construction.latestContract.id === contract.id;

    const onChangeContract = (c: Contract) => {
        setState({ ...state, contract: c });
    };

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
                        setCurrentContract={onChangeContract}
                    />
                    <MigratedConstructionDocument
                        currentContract={state.contract}
                        displayManageSheetInfo={
                            state.contract.id ===
                            state.construction.contracts[0].id
                        }
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
                    setCurrentContract={onChangeContract}
                />
                <Card>
                    <Card.Body>
                        <div className='mb-4'>
                            <h6 className='font-weight-bold mb-2'>
                                工事費内訳書
                            </h6>
                            {contract?.costDocumentInfo ? (
                                contract.isDisplayDistributedPrice ? (
                                    <div className='d-flex justify-content-between align-items-center'>
                                        <a
                                            download
                                            href={
                                                process.env
                                                    .NEXT_PUBLIC_API_ORIGIN +
                                                contract?.costDocumentInfo.path
                                            }
                                        >
                                            <FA
                                                icon={faFileAlt}
                                                className='mr-2'
                                            />
                                            {
                                                contract?.costDocumentInfo
                                                    .filename
                                            }
                                        </a>
                                    </div>
                                ) : (
                                    <p>契約登録以降に表示されます</p>
                                )
                            ) : (
                                <p>工事費内訳書が添付されていません。</p>
                            )}
                        </div>
                        <div className='mb-4'>
                            <h6 className='font-weight-bold mb-2'>
                                工事管理シート
                            </h6>
                            {contract?.manageSheetInfo ? (
                                <div className='d-flex justify-content-between align-items-center'>
                                    <a
                                        download
                                        href={
                                            contract?.manageSheetInfo?.path
                                                ? process.env
                                                      .NEXT_PUBLIC_API_ORIGIN +
                                                  contract?.manageSheetInfo
                                                      ?.path
                                                : ''
                                        }
                                    >
                                        <FA icon={faFileAlt} className='mr-2' />
                                        {contract?.manageSheetInfo?.filename}
                                    </a>
                                </div>
                            ) : (
                                <p>工事管理シートが送付されていません。</p>
                            )}
                        </div>
                        <div className='text-right'>
                            {isLatest && contract.nextAction === 'approval' && (
                                <UploadDesignDocumentButtonWithModal
                                    construction={construction}
                                    showModal={showModal}
                                    setShowModal={sm =>
                                        setState({
                                            ...state,
                                            showModal: sm,
                                        })
                                    }
                                    onCompleteEstimation={() =>
                                        location.reload()
                                    }
                                />
                            )}
                            <Button
                                disabled={
                                    !(
                                        isLatest &&
                                        contract.nextAction === 'approval'
                                    )
                                }
                                onClick={() =>
                                    setState({ ...state, showModal: true })
                                }
                                variant='outline-dark'
                            >
                                再アップロード
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
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

export default ConstructionDocuments;
