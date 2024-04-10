import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';

interface Props {
    id: string;
    isUploaded: boolean;
    onFileUpload: (file: File) => void;
}

export const MigratedFileUploadIcon: FC<Props> = props =>
    props.isUploaded ? (
        <label
            htmlFor={props.id}
            style={{
                width: '24px',
                height: '24px',
                margin: '0px',
                borderRadius: '12px',
                display: 'inline-block',
                fontSize: '0.75rem',
                backgroundColor: '#D5EDD9',
                border: '1px solid #138A6B',
            }}
        >
            <input
                type='file'
                id={props.id}
                className='d-none'
                onChange={e => {
                    e.preventDefault();
                    return (
                        e.target.files &&
                        e.target.files[0] &&
                        props.onFileUpload(e.target.files[0])
                    );
                }}
            />
            <FontAwesomeIcon style={{ color: '#138A6B' }} icon={faUpload} />
        </label>
    ) : (
        <>
            <label
                className='border text-dark'
                htmlFor={props.id}
                style={{
                    width: '24px',
                    height: '24px',
                    margin: '0px',
                    borderRadius: '12px',
                    display: 'inline-block',
                    fontSize: '0.75rem',
                }}
            >
                <FontAwesomeIcon className='text-dark' icon={faUpload} />
            </label>
            <input
                type='file'
                id={props.id}
                className='d-none'
                onChange={e => {
                    e.preventDefault();
                    return (
                        e.target.files &&
                        e.target.files[0] &&
                        props.onFileUpload(e.target.files[0])
                    );
                }}
            />
        </>
    );
