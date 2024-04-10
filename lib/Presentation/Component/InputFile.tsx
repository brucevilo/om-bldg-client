import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC, useCallback, useRef } from 'react';

interface Props {
    onChange: (file: File) => void;
}

export const InputFile: FC<Props> = ({ onChange }) => {
    const inputFile = useRef<HTMLInputElement>(null);

    const onChangeFile: React.ChangeEventHandler<HTMLInputElement> =
        useCallback(e => {
            const file = e.target.files?.item(0);
            if (file) {
                onChange(file);
            }
        }, []);

    return (
        <>
            <input
                type='file'
                ref={inputFile}
                style={{ display: 'none' }}
                onChange={onChangeFile}
            />
            <div
                onClick={() => inputFile.current?.click()}
                style={{ cursor: 'pointer' }}
            >
                <FontAwesomeIcon icon={faUpload} />
            </div>
        </>
    );
};
