import { Contract } from '@/Domain/Entity';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { Row, Container, Col } from 'react-bootstrap';

interface Props {
    currentContract: Contract;
}

export const MigratedDesignContract: FC<Props> = props => {
    return (
        <Container fluid>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    契約書
                </Col>
                <Col sm='9' className='border p-3 bg-white'>
                    {props.currentContract.contractFileInfo ? (
                        <a
                            download
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                props.currentContract.contractFileInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FontAwesomeIcon
                                icon={faFileAlt}
                                className='mr-2'
                            />
                            {props.currentContract.contractFileInfo.filename}
                        </a>
                    ) : (
                        '未登録'
                    )}
                </Col>
            </Row>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    査定表
                </Col>
                <Col sm='9' className='border p-3 bg-white'>
                    {props.currentContract.assessmentFileInfo ? (
                        <a
                            download
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                props.currentContract.assessmentFileInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FontAwesomeIcon
                                icon={faFileAlt}
                                className='mr-2'
                            />
                            {props.currentContract.assessmentFileInfo.filename}
                        </a>
                    ) : (
                        '未登録'
                    )}
                </Col>
            </Row>
        </Container>
    );
};
