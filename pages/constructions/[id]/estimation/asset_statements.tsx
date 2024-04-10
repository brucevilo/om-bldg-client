import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    EstimationTabs,
    ConstructionTabWrapper,
    ContractVersionTabs,
} from '@/Presentation/Component';
import { Table, AccordionCollapse, Accordion } from 'react-bootstrap';
import {
    AssetStatement,
    ConstructionStatement,
    Construction,
    Contract,
} from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionStatementRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import { assertsIsExists } from '@/Infrastructure';
import { useRouter } from 'next/router';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';

interface Props {
    id: number;
    contractId: number | null;
}

interface State {
    assetStatements: AssetStatement[];
    constructionStatements: ConstructionStatement[];
    construction: Construction;
    contract: Contract;
}

const AssetStatements: NextPage<Props> = ({ id, contractId }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const router = useRouter();
    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        const assetStatements =
            await AssetStatementRepository.listByConstruction(
                id,
                contractId || construction.latestContract.id,
            );
        const constructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                contractId || construction.latestContract.id,
            );
        const contract = construction.contracts.find(
            c => c.id === (contractId || construction.latestContract.id),
        );
        assertsIsExists(contract);
        setState({
            contract,
            construction,
            assetStatements,
            constructionStatements,
        });
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    const onChangeContract = async (contract: Contract) => {
        router.push(
            `/constructions/${id}/estimation/asset_statements?contract_id=${contract.id}`,
        );
    };

    if (!state) return null;

    const { construction, contract, assetStatements, constructionStatements } =
        state;
    const constructionRows = constructionStatements.map(con => {
        const assetStatementRows = assetStatements.map(as => {
            if (constructionStatements.length === 0) return;
            const constructionStatement = constructionStatements.find(
                cs => cs.id === as.constructionStatementId,
            );
            assertsIsExists(
                constructionStatement,
                '対応する工事明細が存在しません',
            );
            return (
                <tr key={id}>
                    {con.name === constructionStatement.name && (
                        <>
                            <td title={as.name}>{as.name}</td>
                            <td className='number'>
                                {as.distributedPrice.toLocaleString()}
                            </td>
                            <td style={{ paddingLeft: '100px' }}>
                                {as.assetClass?.code || ''}
                            </td>
                            <td title={as.assetClass?.name || ''}>
                                {as.assetClass?.name || ''}
                            </td>
                        </>
                    )}
                </tr>
            );
        });
        return (
            <Accordion key={id} defaultActiveKey={con.name}>
                <div>
                    <span className='mr-3'>{con.name}</span>
                    <Accordion.Toggle
                        as='button'
                        className='border-0'
                        eventKey={con.name}
                    >
                        <FA icon={faChevronUp} />
                    </Accordion.Toggle>
                </div>
                <AccordionCollapse eventKey={con.name}>
                    <div className='table-responsive'>
                        <Table className='bg-white'>
                            <thead>
                                <tr>
                                    <th style={{ width: '200px' }}>資産名称</th>
                                    <th
                                        style={{
                                            width: '200px',
                                            textAlign: 'right',
                                        }}
                                    >
                                        金額
                                    </th>
                                    <th
                                        style={{
                                            width: '250px',
                                            paddingLeft: '100px',
                                        }}
                                    >
                                        資産クラスコード
                                    </th>
                                    <th style={{ width: '600px' }}>
                                        資産クラス名称
                                    </th>
                                </tr>
                            </thead>
                            {assetStatementRows}
                        </Table>
                    </div>
                </AccordionCollapse>
            </Accordion>
        );
    });

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
                <div>{constructionRows}</div>
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

export default AssetStatements;
