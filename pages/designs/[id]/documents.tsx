import { Contract, ContractNextAction, Design } from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';
import { AssessmentStatement } from '@/Domain/Entity';
import {
    Page,
    DesignDetailTabs,
    DesignActionButton,
    Tabs,
    ContractVersionTabs,
} from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Card, Table, Accordion } from 'react-bootstrap';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { uniq } from 'lodash';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { assertsIsExists } from '@/Infrastructure';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';
import { MigratedDesignDocument } from '@/Presentation/Component/MigratedDesign/MigratedDesignDocument';

interface Props {
    id: number;
    contractId: number | null;
    tab: string;
}

interface State {
    design: Design;
    contract: Contract;
    assessmentStatements: AssessmentStatement[];
}

const costDocumentUploadable = (na: ContractNextAction) => {
    return ['upload_cost_document', 'approval'].includes(na);
};

const AssessmentStatementTable = (props: {
    statements: AssessmentStatement[];
}) => {
    const rows = props.statements.map(s => (
        <tr key={s.name}>
            <td>{s.name}</td>
            <td>{s.price?.toLocaleString()}</td>
            <td>{s.amount}</td>
            <td>{s.costDocumentPrice.toLocaleString()}</td>
        </tr>
    ));
    const [show, setShow] = useState(true);
    return (
        <Accordion defaultActiveKey='0' className='mb-4'>
            <Card>
                <Card.Body className='d-flex justify-content-between align-items-center'>
                    <span className='font-weight-bold'>
                        {props.statements[0].part}
                    </span>
                    <div>
                        <span className='font-weight-bold mr-4'>
                            {props.statements
                                .reduce(
                                    (total, statement) =>
                                        total + statement.costDocumentPrice,
                                    0,
                                )
                                .toLocaleString()}
                        </span>
                        {show ? (
                            <Accordion.Toggle
                                as='a'
                                eventKey='0'
                                onClick={() => setShow(false)}
                            >
                                <FA icon={faAngleDown} className='text-info' />
                            </Accordion.Toggle>
                        ) : (
                            <Accordion.Toggle
                                as='a'
                                eventKey='0'
                                onClick={() => setShow(true)}
                            >
                                <FA icon={faAngleUp} className='text-info' />
                            </Accordion.Toggle>
                        )}
                    </div>
                </Card.Body>
                <Accordion.Collapse eventKey='0'>
                    <Table hover className='mb-4'>
                        <thead>
                            <tr>
                                <th>項目名称</th>
                                <th style={{ width: '200px' }}>単価</th>
                                <th style={{ width: '100px' }}>数量</th>
                                <th style={{ width: '200px' }}>金額</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                    </Table>
                </Accordion.Collapse>
            </Card>
        </Accordion>
    );
};

const AssessmentStatementTables = (props: {
    statements: AssessmentStatement[];
}) => {
    const parts = uniq(props.statements.map(s => s.part));
    const tables = parts.map(p => (
        <AssessmentStatementTable
            key={p}
            statements={props.statements.filter(s => s.part === p)}
        />
    ));
    return <>{tables}</>;
};

const DesignSummary: NextPage<Props> = ({ id, contractId, tab }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const router = useRouter();

    const fetchData = async () => {
        const design = await DesignRepository.get(id);
        const contract = contractId
            ? design.contracts.find(c => c.id === contractId)
            : design.latestContract;
        assertsIsExists(contract);
        const assessmentStatements =
            await AssessmentStatementRepository.findByContract(contract.id);
        setState({
            design,
            contract,
            assessmentStatements,
        });
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    if (!state) return null;

    const { design, contract, assessmentStatements } = state;

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
                    <ContractVersionTabs
                        contractable={design}
                        currentContract={contract}
                        setCurrentContract={c =>
                            router.push(
                                `/designs/${id}/documents?contract_id=${c.id}`,
                            )
                        }
                    />
                    <MigratedDesignDocument currentContract={contract} />
                </section>
            </Page>
        );
    }

    if (!contract.costDocumentInfo) {
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
                        setCurrentContract={c =>
                            router.push(
                                `/designs/${id}/documents?contract_id=${c.id}`,
                            )
                        }
                    />
                    <Card>
                        <Card.Body>
                            <div className='d-flex justify-content-between align-items-center'>
                                <span>設計書が登録されていません</span>
                                <DesignActionButton
                                    design={design}
                                    disabled={
                                        !costDocumentUploadable(
                                            contract.nextAction,
                                        )
                                    }
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </section>
            </Page>
        );
    }

    const tabContent =
        tab === 'details' ? (
            <AssessmentStatementTables statements={assessmentStatements} />
        ) : (
            <Card>
                <Card.Body>
                    <div className='mb-4'>
                        <h6 className='font-weight-bold mb-2'>内訳書</h6>
                        {contract.isDisplayDistributedPrice ? (
                            <a
                                download
                                href={
                                    process.env.NEXT_PUBLIC_API_ORIGIN +
                                    contract.costDocumentInfo?.path
                                }
                                style={{ textDecoration: 'none' }}
                            >
                                <FA icon={faFileAlt} className='mr-2' />
                                {contract.costDocumentInfo?.filename}
                            </a>
                        ) : (
                            <p>契約登録以降に表示されます</p>
                        )}
                    </div>
                    {/* next actionをupload_cost_documentにして仕様書・内訳書のactionbuttonを出す */}
                    <DesignActionButton
                        design={{
                            ...design,
                            latestContract: {
                                ...design.latestContract,
                                nextAction: 'upload_cost_document',
                                taxRate: 0,
                                rate: 0,
                                tax: 0,
                                isPrivatized: true,
                                contractedPriceWithoutTax: 0,
                                rateDown4: 0,
                                isDisplayDistributedPrice:
                                    contract.isDisplayDistributedPrice,
                            },
                            contractTypeText: '',
                            prevContract: design.latestContract,
                            firstContract: design.firstContract,
                            isContractChanged: true,
                        }}
                        disabled={!costDocumentUploadable(contract.nextAction)}
                    />
                </Card.Body>
            </Card>
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
                    setCurrentContract={c =>
                        router.push(
                            `/designs/${id}/documents?contract_id=${c.id}`,
                        )
                    }
                />
                <div className='d-flex justify-content-center mb-4'>
                    <Tabs
                        items={[
                            {
                                text: '基本情報',
                                href: `/designs/${id}/documents?contract_id=${contractId}&tab=common`,
                                isActive: url => !url.includes('tab=details'),
                            },
                            {
                                text: '設計詳細',
                                href: `/designs/${id}/documents?contract_id=${contractId}&tab=details`,
                                isActive: url => url.includes('tab=details'),
                            },
                        ]}
                        isRounded
                    />
                </div>
                {tabContent}
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
            contractId: Number(query.contract_id) || null,
            tab: (query.tab as string) || 'common',
        },
    };
};

export default DesignSummary;
