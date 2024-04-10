import { Contract } from '@/Domain/Entity';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { Row, Container, Col } from 'react-bootstrap';

interface Props {
    currentContract: Contract;
}

export const MigratedConstructionRetirementAndConstructionInProgress: FC<
    Props
> = props => {
    return (
        <Container fluid>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    検査調書
                </Col>
                <Col sm='9' className='border p-3 bg-white'>
                    {props.currentContract.migratedHandoverDocumentInfo ? (
                        <a
                            download
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                props.currentContract
                                    .migratedHandoverDocumentInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FontAwesomeIcon
                                icon={faFileAlt}
                                className='mr-2'
                            />
                            {
                                props.currentContract
                                    .migratedHandoverDocumentInfo.filename
                            }
                        </a>
                    ) : (
                        '未登録'
                    )}
                </Col>
            </Row>
        </Container>
    );
};
