import React, { useEffect, useState, FormEventHandler } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, Tabs } from '@/Presentation/Component';
import {
    ProjectRepository,
    DesignRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import Link from 'next/link';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { Construction, Design, Project } from '@/Domain/Entity';
import { DeleteDataModal } from '@/Presentation/Component/DeleteDataModal';
import router from 'next/router';

interface Props {
    id: number;
}

interface State {
    project: Project;
    designs: Design[];
    constructions: Construction[];
    showDeleteDataModal: boolean;
}

export const ProjectShow: NextPage<Props> = ({ id }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    const fetchData = async () => {
        const project = await ProjectRepository.get(id);
        const designs = await DesignRepository.listByProject(project);
        const constructions = await ConstructionRepository.listByProject(
            project,
        );
        setState({
            project: project,
            designs: designs,
            constructions: constructions,
            showDeleteDataModal: false,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);
    if (!state) return null;

    const { project, designs, constructions, showDeleteDataModal } = state;

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
                                as: `/projects/${id}`,
                                text: '基本情報',
                            },
                            {
                                href: '/projects/[id]/wbs',
                                as: `/projects/${id}/wbs`,
                                text: 'WBS',
                            },
                            {
                                href: '/projects/[id]/relations',
                                as: `/projects/${id}/relations`,
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
                                onClick={() =>
                                    setState({
                                        ...state,
                                        showDeleteDataModal: true,
                                    })
                                }
                            >
                                削除する
                            </Button>
                        </div>
                    )}
                </div>
                <Table bordered>
                    <tr>
                        <th className='bg-light w-25'>PJコード</th>
                        <td>{project.code}</td>
                    </tr>
                    <tr>
                        <th className='bg-light w-25'>事業名</th>
                        <td>{project.name}</td>
                    </tr>
                    <tr>
                        <th className='bg-light w-25'>事業種別</th>
                        <td>{project.classificationText}</td>
                    </tr>
                    <tr>
                        <th className='bg-light w-25'>予算</th>
                        <td>{project.budget.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <th className='bg-light w-25'>企画書/WBS</th>
                        <td>
                            <a
                                target='__blank'
                                href={
                                    process.env.NEXT_PUBLIC_API_ORIGIN +
                                    (project.fileInfo?.path || '')
                                }
                            >
                                {project.fileInfo?.filename}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <th className='bg-light w-25'>メモ</th>
                        <td> {project.note}</td>
                    </tr>
                </Table>
                <div className='d-flex justify-content-end'>
                    <Link href={`/projects/${id}/edit`} passHref>
                        <Button variant='light' className='bg-white border'>
                            編集
                        </Button>
                    </Link>
                </div>
            </section>
            <DeleteDataModal
                onDelete={deleteProject}
                ableDelete={designs.length === 0 && constructions.length === 0}
                data={project}
                show={showDeleteDataModal}
                onHide={() =>
                    setState({ ...state, showDeleteDataModal: false })
                }
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

export default ProjectShow;
