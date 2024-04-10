import React, { useState, useEffect } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, EditDesignFormGroup } from '@/Presentation/Component';
import { EditDesignForm, EditDesign } from '@/App/Service';
import { DesignRepository } from '@/Domain/Repository';
import { useRouter } from 'next/router';
import { Design } from '@/Domain/Entity';
import { Navbar, Nav } from 'react-bootstrap';
import Link from 'next/link';

interface Props {
    designId: number;
}

export const DesignShow: NextPage<Props> = ({ designId }) => {
    const [editForm, setEditForm] = useState<EditDesignForm>();
    const [design, setDesign] = useState<Design>();
    const router = useRouter();

    useEffect(() => {
        DesignRepository.get(designId).then(design => {
            setDesign(design);
            setEditForm(EditDesign.designToForm(design));
        });
    }, []);

    if (!editForm || !design) return null;

    const onSubmit: React.FormEventHandler = async e => {
        e.preventDefault();
        const newDesign = EditDesign.formToDesign(editForm);
        await DesignRepository.update(newDesign, newDesign.latestContract);
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
                            {editForm?.name}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <EditDesignFormGroup
                    editForm={editForm}
                    onChange={setEditForm}
                    onSubmit={onSubmit}
                    designId={designId}
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
            designId: Number(params?.id),
        },
    };
};

export default DesignShow;
