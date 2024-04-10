import {
    Page,
    ConstructionTabWrapper,
    ContractVersionTabs,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect } from 'react';
import {
    AssetStatement,
    CIP,
    Construction,
    ConstructionStatement,
    Contract,
} from '@/Domain/Entity';
import {
    CIPRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
    AssetStatementRepository,
} from '@/Domain/Repository';
import { Card, Button, Container, Row, Col } from 'react-bootstrap';
import {
    RetirementResult,
    ConstructionInProgressResult,
} from '@/Presentation/Component';
import Link from 'next/link';
import { assertsIsExists } from '@/Infrastructure';
import { useRouter } from 'next/router';
import { DateTime } from 'luxon';
import {
    faChevronUp,
    faChevronDown,
    faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { xor } from 'lodash';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';
import { MigratedConstructionRetirementAndConstructionInProgress } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionRetirementAndConstructionInProgress';
interface Props {
    id: number;
    isRetirement: boolean;
    contractId: number | null;
}
interface State {
    construction: Construction;
    contract: Contract;
    constructionStatements: ConstructionStatement[];
    assetStatements: AssetStatement[];
    cips: CIP[];
}

const ConstructionRetirementAndConstructionInProcess: NextPage<Props> = ({
    id,
    isRetirement,
    contractId,
}) => {
    const [state, setState] = useState<State>();
    const router = useRouter();
    const [cipsDetailOpenIds, setCipsDetailOpenIds] = useState<number[]>([]);
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        const contract = contractId
            ? construction.contracts.find(c => c.id === contractId)
            : construction.latestContract;
        assertsIsExists(contract);
        const constructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                contract.id,
            );
        const assetStatements =
            await AssetStatementRepository.listByConstruction(id, contract.id);
        const cips = await CIPRepository.findByContract(contract.id);
        setState({
            construction,
            contract,
            constructionStatements,
            assetStatements,
            cips,
        });
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    if (!state) return null;

    const {
        construction,
        cips,
        constructionStatements,
        assetStatements,
        contract,
    } = state;

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
                        setCurrentContract={c =>
                            router.push(
                                `/constructions/${id}/retirement_and_construction_in_progress?contract_id=${c.id}`,
                            )
                        }
                    />
                    <MigratedConstructionRetirementAndConstructionInProgress
                        currentContract={state.contract}
                    />
                </section>
            </Page>
        );
    }

    if (!contract)
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
                        setCurrentContract={c =>
                            router.push(
                                `/constructions/${id}/retirement_and_construction_in_progress?contract_id=${c.id}`,
                            )
                        }
                    />
                    <Card>
                        <Card.Body>
                            <div className='d-flex justify-content-between'>
                                <span>建仮精算・除却が登録されていません</span>
                            </div>
                        </Card.Body>
                    </Card>
                </section>
            </Page>
        );
    const cipTables = cips.map(cip => (
        <div className='mb-4' key={cip.id}>
            <div className='d-flex mb-3'>
                <h3
                    style={{ fontSize: '16px' }}
                    className='font-weight-bold mr-2'
                >
                    {DateTime.fromJSDate(cip.createdAt).toFormat(
                        'yyyy年MM月dd日',
                    )}
                </h3>
                <FA
                    className='text-primary'
                    style={{ fontSize: '20px' }}
                    icon={
                        cipsDetailOpenIds.includes(cip.id)
                            ? faChevronDown
                            : faChevronUp
                    }
                    onClick={() =>
                        setCipsDetailOpenIds(xor(cipsDetailOpenIds, [cip.id]))
                    }
                />
            </div>

            {cipsDetailOpenIds.includes(cip.id) ? (
                <Container key={cip.id} fluid>
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            工事情報引継書
                        </Col>
                        <Col
                            sm='9'
                            className='border p-3 bg-white d-flex justify-content-between'
                        >
                            <a
                                download
                                href={
                                    (process.env.NEXT_PUBLIC_API_ORIGIN || '') +
                                    cip.handoverDocumentInfo?.path
                                }
                                style={{ textDecoration: 'none' }}
                            >
                                <FA icon={faFileAlt} className='mr-2' />
                                {cip.handoverDocumentInfo?.filename}
                            </a>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            メモ
                        </Col>
                        <Col
                            sm='9'
                            className='border p-3 bg-white d-flex justify-content-between'
                        >
                            {cip.memo}
                        </Col>
                    </Row>
                </Container>
            ) : null}
        </div>
    ));
    const contractIdQuery = contractId ? `contract_id=${contractId}` : '';
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
                    setCurrentContract={c =>
                        router.push(
                            `/constructions/${id}/retirement_and_construction_in_progress?contract_id=${c.id}`,
                        )
                    }
                />
                {ContractNextActionNumber[contract.nextAction] >=
                ContractNextActionNumber.construction ? (
                    <>
                        {cipTables}
                        <div className='mb-4'>
                            <Link
                                href={`/constructions/${id}/retirement_and_construction_in_progress?${contractIdQuery}`}
                                passHref
                            >
                                <Button
                                    as='a'
                                    variant={
                                        isRetirement ? 'outline-info' : 'info'
                                    }
                                    className='mr-3 rounded-pill'
                                >
                                    建仮精算結果
                                </Button>
                            </Link>
                            <Link
                                href={`/constructions/${id}/retirement_and_construction_in_progress?is_retirement=true&${contractIdQuery}`}
                                passHref
                            >
                                <Button
                                    as='a'
                                    variant={
                                        isRetirement ? 'info' : 'outline-info'
                                    }
                                    className='rounded-pill'
                                >
                                    除却結果
                                </Button>
                            </Link>
                        </div>
                        {isRetirement ? (
                            <RetirementResult
                                construction={state.construction}
                            />
                        ) : (
                            <ConstructionInProgressResult
                                construction={construction}
                                constructionStatements={constructionStatements}
                                assetStatements={assetStatements}
                            />
                        )}
                    </>
                ) : (
                    <Card>
                        <Card.Body>
                            <div className='d-flex justify-content-between align-items-center'>
                                <span>
                                    契約登録されていません。先に前のプロセスを行ってください。
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
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
            isRetirement: query?.is_retirement ? true : false,
            contractId: query.contract_id ? Number(query.contract_id) : null,
        },
    };
};

export default ConstructionRetirementAndConstructionInProcess;
