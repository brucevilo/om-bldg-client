import React, { useState, useEffect, FormEvent } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page } from '@/Presentation/Component';
import { Construction, ConstructionStatement } from '@/Domain/Entity';
import {
    ConstructionRepository,
    ConstructionStatementRepository,
} from '@/Domain/Repository';
import { FormCheck, Button, Form, Navbar, Nav, Card } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { assertsIsExists } from '@/Infrastructure';
import Link from 'next/link';

interface Props {
    id: number;
}

const SelectConstructionStatementRetirement: NextPage<Props> = ({ id }) => {
    const [construction, setConstruction] = useState<Construction>();
    const [constructionStatements, setConstructionStatements] = useState<
        ConstructionStatement[]
    >([]);
    const [selectedConstructionStatement, setSelectedConstructionStatement] =
        useState<ConstructionStatement>();

    const router = useRouter();

    const fetchData = async () => {
        const fetchedConstruction = await ConstructionRepository.get(id);
        setConstruction(fetchedConstruction);
        const fetchedConstructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                fetchedConstruction.latestContract.id,
            );
        setConstructionStatements(
            fetchedConstructionStatements.filter(cs => !cs.isRetiremented),
        );
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedConstructionStatement) {
            alert('除却対象の工事明細を選択してください');
            return;
        }
        const index = selectedConstructionStatement?.name.indexOf('-');
        router.push(
            `/constructions/${id}/retirement/select_cost_items?constructionStatementId=${
                selectedConstructionStatement.id
            }&tagName=${selectedConstructionStatement.name.slice(2, index)}`,
        );
    };

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href='/constructions' passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>除却</span>
                        <small className='text-secondary'>
                            {construction?.name || ''})
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <p className='font-weight-bold mb-4'>
                    除却対象を選択してください。
                </p>
                <Form onSubmit={onSubmit}>
                    {constructionStatements.map(cs => (
                        <Card key={cs.id} className='mb-4'>
                            <Card.Body>
                                <FormCheck className='d-flex align-items-center'>
                                    <FormCheck.Input
                                        type='radio'
                                        style={{ cursor: 'pointer' }}
                                        onChange={() =>
                                            setSelectedConstructionStatement(cs)
                                        }
                                        id={`construction-statement-id-${cs.id}`}
                                        checked={
                                            cs.id ===
                                            selectedConstructionStatement?.id
                                        }
                                        value={cs.id as number}
                                    />
                                    <FormCheck.Label
                                        style={{
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                        }}
                                        htmlFor={`construction-statement-id-${cs.id}`}
                                    >
                                        {cs.name}
                                    </FormCheck.Label>
                                </FormCheck>
                            </Card.Body>
                        </Card>
                    ))}
                    <div className='d-flex justify-content-end'>
                        <Button
                            type='submit'
                            variant='light'
                            className='bg-white border'
                        >
                            対象工事を指定する
                        </Button>
                    </div>
                </Form>
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    assertsIsExists(params, 'paramsがありません');
    return {
        props: { id: Number(params.id) },
    };
};

export default SelectConstructionStatementRetirement;
