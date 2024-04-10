import { Design } from '@/Domain/Entity';
import React, { FC } from 'react';
import { Button } from 'react-bootstrap';
import { Breadcrumb } from './Breadcrumb';

interface Props {
    design: Design;
    displayDeleteButton: () => void;
}

const DesignHeaderBreadcrumb: FC<Props> = props => {
    const { design, displayDeleteButton } = props;
    return (
        <>
            <Breadcrumb
                items={[
                    { text: '設計一覧', href: '/designs' },
                    {
                        text: `${design.name}`,
                        href: '/',
                        active: true,
                    },
                ]}
            />
            <div className='d-flex justify-content-between align-items-center mb-4'>
                <div className='d-flex align-items-center'>
                    <h3 className='font-weight-bold mr-4'>
                        {`${design.documentNumber?.dividedHyphen || ''} ${
                            design.name
                        }`}
                    </h3>
                </div>
                <div>
                    <Button
                        className='bg-white border px-2 py-0'
                        style={{ color: 'gray', fontSize: '20px' }}
                        onClick={() => displayDeleteButton()}
                    >
                        …
                    </Button>
                </div>
            </div>
        </>
    );
};

export default DesignHeaderBreadcrumb;
