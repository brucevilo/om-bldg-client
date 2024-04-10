import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, EditDesignFormGroup } from '@/Presentation/Component';
import { EditDesignForm, EditDesign } from '@/App/Service';
import { Navbar, Nav } from 'react-bootstrap';
import { Project } from '@/Domain/Entity';
import { ProjectRepository, DesignRepository } from '@/Domain/Repository';
import { useRouter } from 'next/router';
import { assertsIsExists } from '@/Infrastructure';
import Link from 'next/link';

interface Props {
    projectId: number;
}

export const DesignNew: NextPage<Props> = ({ projectId }) => {
    const [editForm, setEditForm] = useState<EditDesignForm>(
        EditDesign.createEmptyForm(),
    );
    const [project, setProject] = useState<Project>();
    const router = useRouter();

    const fetchData = async () => {
        setProject(await ProjectRepository.get(projectId));
    };

    useEffect(() => {
        fetchData();
    }, []);
    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        assertsIsExists(project, 'Projectが存在しません');
        const newDesign = EditDesign.formToDesign(editForm);
        const contract = newDesign.latestContract;
        await DesignRepository.create(newDesign, contract, [project], []);
        router.push('/designs');
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
                        <span className='mr-4'>設計登録</span>
                        <small className='text-secondary'>
                            {project?.name}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <EditDesignFormGroup
                    editForm={editForm}
                    onChange={setEditForm}
                    onSubmit={onSubmit}
                />
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    query,
}) => {
    return {
        props: {
            projectId: Number(query.project_id),
        },
    };
};

export default DesignNew;
