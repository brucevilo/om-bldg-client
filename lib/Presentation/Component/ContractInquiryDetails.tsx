import { Contract } from '@/Domain/Entity';
import React, { FC, useContext } from 'react';
import Link from 'next/link';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { MasterContext } from '../Context';
import { DateTime } from 'luxon';

export const ContractInqiryDetails: FC<{ contract: Contract }> = ({
    contract,
}) => {
    const { users } = useContext(MasterContext);
    return (
        <div>
            <Container fluid>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        起票日
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        <time>
                            {contract?.inquiryAt
                                ? DateTime.fromJSDate(
                                      contract.inquiryAt,
                                  ).toFormat('yyyy年MM月dd日')
                                : ''}
                        </time>
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        工事稟議番号
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {contract.approvalNumber}
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        登録者
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {users.find(u => u.id === contract.inquiryById)?.name}
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        予定価格（税込み）
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {contract.expectedPriceWithTax?.toLocaleString() ||
                            '---'}
                        円
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        予定価格（税抜）
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {contract.expectedPrice?.toLocaleString() || '---'}円
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        消費税額
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {contract.tax.toLocaleString()}円
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        メモ
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        <p>{contract.inquiryMemo}</p>
                    </Col>
                </Row>
            </Container>
            <div className='text-right mt-3'>
                <Link
                    href={`/contracts/${contract.id}/inquiry?revise=true`}
                    passHref
                >
                    <Button
                        disabled={contract.nextAction !== 'agreement'}
                        as='a'
                        variant='light'
                        className='bg-white border'
                    >
                        修正
                    </Button>
                </Link>
            </div>
        </div>
    );
};
