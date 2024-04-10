import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    SelectProjectModal,
    SelectDesignModal,
    ConstructionTabWrapper,
} from '@/Presentation/Component';
import { Project, Construction, Design } from '@/Domain/Entity';
import {
    ProjectRepository,
    ConstructionRepository,
    DesignRepository,
} from '@/Domain/Repository';
import { Button, Card, ListGroup } from 'react-bootstrap';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { MigratedConstructionRelation } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionRelation';

interface Props {
    id: number;
}

interface State {
    projects: Project[];
    construction: Construction;
    designs: Design[];
}

const useData = (props: Props): State | null => {
    const [state, setState] = useState<State | null>(null);

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(props.id);
        const projects = await ProjectRepository.listByConstruction(
            construction,
        );
        const designs = await DesignRepository.listByConstruction(construction);
        setState({ projects, construction, designs });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return state;
};

const ConstructionRelations: NextPage<Props> = props => {
    const data = useData(props);
    const [addProjectRelation, setAddProjectRelation] = useState(false);
    const [addDesignRelation, setAddDesignRelation] = useState(false);
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    if (!data) return null;

    const { projects, construction, designs } = data;

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
                        id={props.id}
                        construction={construction}
                        displayDeleteButton={displayDeleteButton}
                    />
                    <MigratedConstructionRelation />
                </section>
            </Page>
        );
    }

    const onAddProject = async (projectId: number) => {
        const project = await ProjectRepository.get(projectId);
        await ConstructionRepository.update(
            construction,
            {},
            [...projects, project],
            designs,
        );
        location.reload();
    };

    const onAddDesign = async (designId: number) => {
        const design = await DesignRepository.get(designId);
        await ConstructionRepository.update(construction, {}, projects, [
            ...designs,
            design,
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
    const designList = designs.map(d => (
        <div key={d.id} className='d-flex justify-content-between'>
            <div>
                <span className='mr-4'>{d.id}</span>
                <span>{d.name}</span>
            </div>
            <span className='text-right'>
                {d.latestContract.contractedPrice?.toLocaleString() ||
                    d.latestContract.expectedPrice?.toLocaleString() ||
                    '---'}
                円
            </span>
        </div>
    ));
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
                    id={props.id}
                    construction={construction}
                    displayDeleteButton={displayDeleteButton}
                />
                <Card className='w-100 mb-4'>
                    <ListGroup variant='flush'>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <span className='font-weight-bold'>事業</span>
                            <Button
                                as='a'
                                className='text-primary bg-white border-0'
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
                        <ListGroup.Item className='bg-info text-white font-weight-bold'>
                            工事
                        </ListGroup.Item>
                        <ListGroup.Item className='d-flex justify-content-between'>
                            <div>
                                <span className='mr-4'>{construction.id}</span>
                                <span>{construction.name}</span>
                            </div>
                            <span className='text-right'>
                                {construction.latestContract.contractedPrice?.toLocaleString() ||
                                    construction.latestContract.expectedPrice?.toLocaleString() ||
                                    '---'}
                                円
                            </span>
                        </ListGroup.Item>
                    </ListGroup>
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

export default ConstructionRelations;
