import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    SelectProjectModal,
    SelectConstructionModal,
    DesignDetailTabs,
} from '@/Presentation/Component';
import { Project, Design, Construction } from '@/Domain/Entity';
import {
    ProjectRepository,
    DesignRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import { Button, Card, ListGroup } from 'react-bootstrap';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';
import { MigratedDesignContractRelation } from '@/Presentation/Component/MigratedDesign/MigratedDesignRelation';

interface Props {
    id: number;
}

interface State {
    projects: Project[];
    design: Design;
    constructions: Construction[];
}

const useData = (props: Props): State | null => {
    const [state, setState] = useState<State | null>(null);

    const fetchData = async () => {
        const design = await DesignRepository.get(props.id);
        const projects = await ProjectRepository.listByDesign(design);
        const constructions = await ConstructionRepository.listByDesign(design);
        setState({
            projects,
            design,
            constructions,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return state;
};

const DesignRelations: NextPage<Props> = props => {
    const data = useData(props);

    const [addProjectRelation, setAddProjectRelation] = useState(false);
    const [addConstructionRelation, setAddConstructionRelation] =
        useState(false);
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    if (!data) return null;

    const { projects, design, constructions } = data;

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
                        id={props.id}
                        design={design}
                        displayDeleteButton={displayDeleteButton}
                    />
                    <MigratedDesignContractRelation />
                </section>
            </Page>
        );
    }

    const onAddProject = async (projectId: number) => {
        const project = await ProjectRepository.get(projectId);
        await DesignRepository.update(
            design,
            design.latestContract,
            [...projects, project],
            constructions,
        );
        location.reload();
    };

    const onAddConstruction = async (constructionId: number) => {
        const construction = await ConstructionRepository.get(constructionId);
        await DesignRepository.update(design, design.latestContract, projects, [
            ...constructions,
            construction,
        ]);
        location.reload();
    };

    const projectList = projects.map(p => (
        <div key={p.id} className='d-flex justify-content-between'>
            <div>
                <span className='mr-4'>{p.code}</span>
                <span>{p.name}</span>
            </div>
            <span className='text-right'>{p.budget.toLocaleString()}円</span>
        </div>
    ));

    const constructionList = constructions.map(c => (
        <div key={c.id} className='d-flex justify-content-between'>
            <div>
                <span className='mr-4'>{c.id}</span>
                <span>{c.name}</span>
            </div>
            <span className='text-right'>
                {c.latestContract.contractedPrice?.toLocaleString() ||
                    c.latestContract.expectedPrice?.toLocaleString() ||
                    '---'}
                円
            </span>
        </div>
    ));

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
                    id={props.id}
                    design={design}
                    displayDeleteButton={displayDeleteButton}
                />
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>事業</span>
                            <Button
                                as='a'
                                className='text-info bg-white border-0'
                                onClick={() => setAddProjectRelation(true)}
                            >
                                + 紐付けを追加する
                            </Button>
                        </ListGroup.Item>
                        <ListGroup.Item>{projectList}</ListGroup.Item>
                    </ListGroup>
                </Card>
                <SelectProjectModal
                    title='事業選択'
                    show={addProjectRelation}
                    onSelectProject={onAddProject}
                    onHide={() => setAddProjectRelation(false)}
                />
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='bg-info text-white font-weight-bold'>
                            設計
                        </ListGroup.Item>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <div>
                                <span className='mr-4'>{design.id}</span>
                                <span>{design.name}</span>
                            </div>
                            <span className='text-right'>
                                {design.latestContract.contractedPrice?.toLocaleString() ||
                                    design.latestContract.expectedPrice?.toLocaleString() ||
                                    '---'}
                                円
                            </span>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>工事</span>
                            <Button
                                className='text-info bg-white border-white'
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

export default DesignRelations;
