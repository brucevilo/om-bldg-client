import React, { useEffect, useState } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, EditProjectFormGroup } from '@/Presentation/Component';
import { ProjectRepository } from '@/Domain/Repository';
import { EditProject, EditProjectForm } from '@/App/Service';
import Link from 'next/link';
import { Navbar, Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useProjects } from '@/App/Hook/useProjects';

interface Props {
    id: number;
}

export const ProjectEdit: NextPage<Props> = ({ id }) => {
    const router = useRouter();
    const [editForm, setEditForm] = useState<EditProjectForm>();
    const projects = useProjects();

    useEffect(() => {
        ProjectRepository.get(id).then(project =>
            setEditForm(EditProject.projectToForm(project)),
        );
    }, []);

    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        if (!editForm) return;
        const project = EditProject.formToProject(editForm);
        const updatedProject = await ProjectRepository.update(project);
        setEditForm(EditProject.projectToForm(updatedProject));
        alert('更新しました');
        router.push(`/projects/${id}`);
    };

    if (!editForm) return null;

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href={`/projects/${id}`} passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>事業編集</span>
                        <small className='text-secondary'>
                            {editForm.name}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <EditProjectFormGroup
                    editForm={editForm}
                    onSubmit={onSubmit}
                    onChange={setEditForm}
                    projects={projects}
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

export default ProjectEdit;
