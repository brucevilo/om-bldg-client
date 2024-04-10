import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, AddConstructionFormGroup } from '@/Presentation/Component';
import {
    Design,
    Construction,
    Project,
    DesignContractType,
} from '@/Domain/Entity';
import {
    DesignRepository,
    ConstructionRepository,
    ProjectRepository,
} from '@/Domain/Repository';
import { Button, Navbar, Nav, Card, ListGroup } from 'react-bootstrap';
import { EditConstruction, EditConstructionForm } from '@/App/Service';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { Loading } from '@/Presentation/Component/Loading';

interface Props {
    designId: number;
}

const DesignRelation: NextPage<Props> = ({ designId }) => {
    const [design, setDesign] = useState<Design | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [editForm, setEditForm] = useState<EditConstructionForm | null>(
        EditConstruction.createEmptyFrom(),
    );
    const [constructions, setConstructions] = useState<Construction[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchData = async () => {
        await DesignRepository.get(designId).then(async design => {
            setDesign(design);
            setConstructions(await ConstructionRepository.listByDesign(design));
            const projects = await ProjectRepository.listByDesign(design);
            setEditForm(old => {
                return {
                    ...(old as EditConstructionForm),
                    projectCodes: projects.map(p => p.code),
                    name:
                        design.contractType === DesignContractType.Internal
                            ? design.name
                            : old?.name || '',
                };
            });
        });
        setProjects(await ProjectRepository.index());
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!design) return null;

    const addEditConstruction = async () => {
        if (editForm) return alert('工事の登録が完了されていません。');
        const newEditForm = EditConstruction.createEmptyFrom();
        const projects = await ProjectRepository.listByDesign(design);
        setEditForm({
            ...newEditForm,
            projectCodes: projects.map(p => p.code),
        });
    };

    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        if (editForm?.projectCodes.length === 0)
            return alert(
                '事業が紐付いていません。最低1つ以上、事業を選択してください',
            );
        if (!editForm) return null;
        const newConstruction = EditConstruction.formToConstruction(editForm);
        const newProjects = projects.filter(
            p => editForm.projectCodes.includes(p.code) && p,
        );
        const nc = await ConstructionRepository.create(
            newConstruction,
            {},
            newProjects,
            [design],
        );
        setConstructions([...constructions, nc]);
        setEditForm(null);
    };

    const deleteConstruction = async (construction: Construction) => {
        if (construction.latestContract.nextAction !== 'upload_cost_document') {
            alert(
                '工事に紐づく情報が登録されているため、削除できません。削除したい場合は、管理者にお問い合わせください。',
            );
            return;
        }
        await ConstructionRepository.delete(construction);
        const newConsturions = constructions.filter(
            c => c.id !== construction.id,
        );
        setConstructions(newConsturions);
    };

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href='/designs' passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>工事登録</span>
                        <small className='text-secondary'>{design.name}</small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>設計</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div>
                                <span className='mr-4'>
                                    {design.documentNumber?.dividedHyphen || ''}
                                </span>
                                <span>
                                    <Link
                                        href={'/designs/[id]/summary'}
                                        as={`/designs/${design.id}/summary`}
                                        passHref
                                    >
                                        <a target='_blank'>{design.name}</a>
                                    </Link>
                                </span>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>工事</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            {constructions.map((c, index) => (
                                <div
                                    key={index}
                                    className='d-flex justify-content-between border-bottom py-3 mb-4'
                                >
                                    <div>
                                        <span className='mr-4'>{c.id}</span>
                                        <span>{c.name}</span>
                                    </div>
                                    <button
                                        type='button'
                                        className='close'
                                        aria-label='Close'
                                        onClick={() => deleteConstruction(c)}
                                    >
                                        <span aria-hidden='true'>
                                            <FA icon={faTimesCircle} />
                                        </span>
                                    </button>
                                </div>
                            ))}
                            {editForm && (
                                <AddConstructionFormGroup
                                    editForm={editForm}
                                    onChange={setEditForm}
                                    onSubmit={onSubmit}
                                    projects={projects}
                                    design={design}
                                />
                            )}
                            <div className='text-right'>
                                <Button
                                    variant='link'
                                    onClick={() => addEditConstruction()}
                                >
                                    + 工事を追加する
                                </Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                <div className='text-right'>
                    <span
                        className='d-inline-block'
                        style={!!editForm ? { cursor: 'not-allowed' } : {}}
                    >
                        <Link href='/constructions' passHref>
                            <Button
                                as='a'
                                variant='light'
                                disabled={!!editForm}
                                className='bg-white border'
                            >
                                登録する
                            </Button>
                        </Link>
                    </span>
                </div>
            </section>
            {isLoading && <Loading />}
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
    return {
        props: {
            designId: Number(ctx.query.id),
        },
    };
};

export default DesignRelation;
