import { Contract } from '@/Domain/Entity';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { Row, Container, Col } from 'react-bootstrap';

interface Props {
    currentContract: Contract;
}

export const MigratedDesignDocument: FC<Props> = props => {
    return (
        <Container fluid>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    内訳書
                </Col>
                <Col sm='9' className='border p-3 bg-white'>
                    {props.currentContract.costDocumentInfo ? (
                        <a
                            download
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                props.currentContract.costDocumentInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FontAwesomeIcon
                                icon={faFileAlt}
                                className='mr-2'
                            />
                            {props.currentContract.costDocumentInfo.filename}
                        </a>
                    ) : (
                        '未登録'
                    )}
                </Col>
            </Row>
        </Container>
    );
};
