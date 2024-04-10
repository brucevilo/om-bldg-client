import React, { useState, useEffect, FormEventHandler } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    Tabs,
    SelectDesignModal,
    SelectConstructionModal,
} from '@/Presentation/Component';
import { Project, Design, Construction } from '@/Domain/Entity';
import {
    ProjectRepository,
    DesignRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import { Button, Breadcrumb, Card, ListGroup } from 'react-bootstrap';
import Link from 'next/link';
import router from 'next/router';
import { DeleteDataModal } from '@/Presentation/Component/DeleteDataModal';

interface Props {
    id: number;
}

interface State {
    project: Project;
    designs: Design[];
    constructions: Construction[];
}

const useData = (props: Props): State | null => {
    const [state, setState] = useState<State | null>(null);

    const fetchData = async () => {
        const project = await ProjectRepository.get(props.id);
        const designs = await DesignRepository.listByProject(project);
        const constructions = await ConstructionRepository.listByProject(
            project,
        );
        setState({
            project,
            designs,
            constructions,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return state;
};

const ProjectRelations: NextPage<Props> = props => {
    const data = useData(props);
    const [addDesignRelation, setAddDesignRelation] = useState(false);
    const [addConstructionRelation, setAddConstructionRelation] =
        useState(false);
    const [showDeleteDataModal, setShowDeleteDataModal] =
        useState<boolean>(false);
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    if (!data) return null;

    const { project, designs, constructions } = data;

    const onAddDesign = async (designId: number) => {
        const design = await DesignRepository.get(designId);
        await ProjectRepository.update(
            project,
            [...designs, design],
            constructions,
        );
        location.reload();
    };

    const onAddConstruction = async (constructionId: number) => {
        const construction = await ConstructionRepository.get(constructionId);
        await ProjectRepository.update(project, designs, [
            ...constructions,
            construction,
        ]);
        location.reload();
    };

    const designList = designs.map(d => (
        <div key={d.id} className='d-flex justify-content-between'>
            <div>
                <span className='mr-4'>{d.id}</span>
                <span>{d.name}</span>
            </div>
            <span className='text-right'>
                {d.latestContract.expectedPrice?.toLocaleString() || '---'}円
            </span>
        </div>
    ));
    const constructionList = constructions.map(c => (
        <div key={c.id} className='d-flex justify-content-between'>
            <div>
                <span className='mr-4'>{c.id}</span>
                <span>{c.name}</span>
            </div>
            <span className='text-right'>----円</span>
        </div>
    ));

    const deleteProject: FormEventHandler = async e => {
        e.preventDefault();
        await ProjectRepository.delete(project);
        router.push('/projects');
    };
    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Link href='/projects' passHref>
                        <Breadcrumb.Item>事業一覧</Breadcrumb.Item>
                    </Link>
                    <Breadcrumb.Item active>{project.name}</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            {project.name}
                        </h3>
                    </div>
                    <div>
                        <Button
                            className='bg-white border px-2 py-0'
                            style={{ color: 'gray', fontSize: '20px' }}
                            onClick={() =>
                                setDisplayDeleteButton(!displayDeleteButton)
                            }
                        >
                            …
                        </Button>
                    </div>
                </div>
                <div className='d-flex justify-content-between'>
                    <Tabs
                        className='my-4'
                        items={[
                            {
                                href: '/projects/[id]',
                                as: `/projects/${props.id}`,
                                text: '基本情報',
                            },
                            {
                                href: '/projects/[id]/wbs',
                                as: `/projects/${props.id}/wbs`,
                                text: 'WBS',
                            },
                            {
                                href: '/projects/[id]/relations',
                                as: `/projects/${props.id}/relations`,
                                text: '関連図',
                            },
                        ]}
                    />
                    {displayDeleteButton && (
                        <div style={{ position: 'relative', bottom: '20px' }}>
                            <Button
                                variant='light'
                                className='bg-white border py-2'
                                style={{
                                    color: 'red',
                                    paddingRight: '70px',
                                }}
                                onClick={() => setShowDeleteDataModal(true)}
                            >
                                削除する
                            </Button>
                        </div>
                    )}
                </div>
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='bg-info text-white font-weight-bold'>
                            事業
                        </ListGroup.Item>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <div>
                                <span className='mr-4'>{project.code}</span>
                                <span>{project.name}</span>
                            </div>
                            <span className='text-right'>
                                {project.budget.toLocaleString()}円
                            </span>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>設計</span>
                            <Button
                                as='a'
                                className='text-primary bg-white border-0'
                                onClick={() => setAddDesignRelation(true)}
                            >
                                + 紐付けを追加する
                            </Button>
                        </ListGroup.Item>
                        <ListGroup.Item>{designList}</ListGroup.Item>
                    </ListGroup>
                </Card>
                <SelectDesignModal
                    title='設計選択'
                    show={addDesignRelation}
                    onSelectDesign={onAddDesign}
                    onHide={() => setAddDesignRelation(false)}
                />
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>工事</span>
                            <Button
                                className='text-primary bg-white border-white'
                                onClick={() => setAddConstructionRelation(true)}
                            >
                                + 紐付けを追加する
                            </Button>
                        </ListGroup.Item>
                        <ListGroup.Item>{constructionList}</ListGroup.Item>
                    </ListGroup>
                </Card>
                <SelectConstructionModal
                    title='工事選択'
                    show={addConstructionRelation}
                    onSelectConstruction={onAddConstruction}
                    onHide={() => setAddConstructionRelation(false)}
                />
            </section>
            <DeleteDataModal
                onDelete={deleteProject}
                ableDelete={designs.length === 0 && constructions.length === 0}
                data={project}
                show={showDeleteDataModal}
                onHide={() => setShowDeleteDataModal(false)}
            />
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

export default ProjectRelations;
