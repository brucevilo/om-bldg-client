import {
    AssetStatement,
    Construction,
    ConstructionStatement,
    Design,
} from '@/Domain/Entity';
import {
    AssetStatementRepository,
    ConstructionRepository,
    ConstructionStatementRepository,
    DesignRepository,
} from '@/Domain/Repository';
import {
    CIPCompleteModal,
    CIPTargetSelector,
    Page,
} from '@/Presentation/Component';
import { CIPContext } from '@/Presentation/Context';
import { NextPage, GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import Link from 'next/link';

interface Props {
    id: number;
}

interface State {
    construction: Construction;
    designs: Design[];
    constructionStatements: ConstructionStatement[];
    assetStatements: AssetStatement[];
    selectedConstructionStatementIds: number[];
    showModal: boolean;
}

export const ConstructionInProgress: NextPage<Props> = ({ id }) => {
    const [state, setState] = useState<State>();
    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        const designs = await DesignRepository.listByConstruction(construction);
        const constructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                construction.latestContract.id,
            );
        const assetStatements =
            await AssetStatementRepository.listByConstruction(
                id,
                construction.latestContract.id,
            );
        setState({
            construction,
            designs,
            constructionStatements,
            assetStatements,
            selectedConstructionStatementIds: [],
            showModal: false,
        });
    };
    useEffect(() => {
        fetchData();
    }, []);

    if (!state) return null;

    const {
        construction,
        designs,
        constructionStatements,
        assetStatements,
        selectedConstructionStatementIds,
        showModal,
    } = state;

    return (
        <Page>
            <CIPContext.Provider
                value={{
                    construction,
                    designs,
                    constructionStatements,
                    assetStatements,
                    selectedConstructionStatementIds,
                    onChangeSelectedConstructionStatementIds: ids =>
                        setState({
                            ...state,
                            selectedConstructionStatementIds: ids,
                        }),
                }}
            >
                <Navbar bg='white' className='px-5'>
                    <Link href='/designs' passHref>
                        <Nav.Link className='text-dark font-weight-bold mr-4'>
                            ←
                        </Nav.Link>
                    </Link>
                    <Navbar.Text>
                        <h5 className='text-dark font-weight-bold mb-0'>
                            <span className='mr-4'>建仮精算</span>
                            <small className='text-secondary'>
                                {construction.name}
                            </small>
                        </h5>
                    </Navbar.Text>
                </Navbar>
                <section>
                    <p>建仮精算対象を選択してください。</p>
                    <CIPTargetSelector />
                    <div className='text-right'>
                        <Button
                            variant='light'
                            className='bg-white border'
                            disabled={
                                selectedConstructionStatementIds.length === 0
                            }
                            onClick={() =>
                                setState({ ...state, showModal: true })
                            }
                        >
                            対象工事を指定する
                        </Button>
                    </div>
                </section>
                {showModal && (
                    <CIPCompleteModal
                        show={showModal}
                        onHide={() => setState({ ...state, showModal: false })}
                    />
                )}
            </CIPContext.Provider>
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

export default ConstructionInProgress;
