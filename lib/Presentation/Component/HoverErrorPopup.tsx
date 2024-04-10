import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export const HoverErrorPopup: FC<{ content: string }> = ({ content }) => {
    return (
        <OverlayTrigger
            placement='right'
            delay={{ show: 250, hide: 400 }}
            overlay={props => (
                <Tooltip id='button-tooltip' {...props}>
                    {content}
                </Tooltip>
            )}
        >
            <FontAwesomeIcon
                className='ml-1'
                color='red'
                icon={faExclamationTriangle}
                title={content}
            />
        </OverlayTrigger>
    );
};
