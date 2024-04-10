import React, { FC } from 'react';
import { Spinner } from 'react-bootstrap';

interface Props {
    zIndex?: number;
    left?: number;
}

export const Loading: FC<Props> = ({ zIndex, left }) => {
    return (
        <div
            className='w-100 h-100'
            style={{
                backgroundColor: 'rgba(150,150,150,0.5)',
                position: 'absolute',
                top: '0',
                zIndex,
                left,
            }}
        >
            <div style={{ position: 'absolute', top: '50%', left: '50%' }}>
                <Spinner animation='border' role='status' />
            </div>
        </div>
    );
};
