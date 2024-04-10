import React, { useState } from 'react';
import { NextPage } from 'next';
import { Page, EditProjectFormGroup } from '@/Presentation/Component';
import { ProjectRepository } from '@/Domain/Repository';
import { EditProjectForm, EditProject } from '@/App/Service';
import { Navbar, Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useProjects } from '@/App/Hook/useProjects';

export const ProjectNew: NextPage = () => {
    const [editForm, setEditForm] = useState<EditProjectForm>(
        EditProject.createEmptyForm(),
    );

    const router = useRouter();

    const projects = useProjects();

    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        const project = EditProject.formToProject(editForm);
        await ProjectRepository.create(project);
        alert('登録が完了しました');
        router.push('/projects');
    };

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href='/projects' passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        事業登録
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <EditProjectFormGroup
                    editForm={editForm}
                    onChange={setEditForm}
                    onSubmit={onSubmit}
                    projects={projects}
                />
            </section>
        </Page>
    );
};

export default ProjectNew;
