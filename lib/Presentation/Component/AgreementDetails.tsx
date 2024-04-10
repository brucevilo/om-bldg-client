import { Construction, Contract, Design } from '@/Domain/Entity';
import React, { FC, useContext, useState } from 'react';
import Link from 'next/link';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { DateTime } from 'luxon';
import { MasterContext } from '../Context';
import { AssessmentSheet } from './AssessmentSheet';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { assertsIsExists } from '@/Infrastructure';
import { useFetchedAssessment } from '@/App/Hook/useFetchedAssessment';
import { generateAssessment } from '@/App/Service/GenerateAssessmentSheet';

export const AgreementDetails: FC<{
    contract: Contract;
    contractable: Construction | Design;
    id?: number;
}> = ({ contract, contractable, id }) => {
    const { users, suppliers } = useContext(MasterContext);
    const [isShowBaseInfo, setIsShowBaseInfo] = useState(true);
    const [assessment, setAssessment] = useFetchedAssessment(
        contract,
        contractable,
    );
    const firstContract = contractable.contracts[0];
    const saveAssessmentStatementsIsOpen = async () => {
        assertsIsExists(assessment);
        await AssessmentStatementRepository.update(assessment.statements);
        alert('開閉状況を保存しました');
    };

    if (
        ContractNextActionNumber[contract.nextAction] <
        ContractNextActionNumber.agreement
    )
        return (
            <Card>
                <Card.Body>
                    <div className='d-flex justify-content-between'>
                        <span>
                            契約伺いが登録されていません。先に前のプロセスを行ってください
                        </span>
                    </div>
                </Card.Body>
            </Card>
        );
    if (
        ContractNextActionNumber[contract.nextAction] ===
        ContractNextActionNumber.agreement
    )
        return (
            <Card>
                <Card.Body>
                    <div className='d-flex justify-content-between align-items-center'>
                        <span>契約登録されていません</span>
                        <Link
                            href={`/contracts/${contract.id}/agreement`}
                            passHref
                        >
                            <Button variant='light' className='bg-white border'>
                                契約登録
                            </Button>
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        );
    return (
        <div>
            <div className='d-flex justify-content-center mb-4'>
                <Button
                    as='a'
                    variant={isShowBaseInfo ? 'info' : 'outline-info'}
                    className='mr-3 rounded-pill'
                    style={{
                        width: '100px',
                        height: '50px',
                        fontSize: '15px',
                        paddingTop: '9px',
                    }}
                    onClick={() => setIsShowBaseInfo(true)}
                >
                    基本情報
                </Button>
                <Button
                    as='a'
                    variant={isShowBaseInfo ? 'outline-info' : 'info'}
                    className='rounded-pill'
                    style={{
                        width: '100px',
                        height: '50px',
                        fontSize: '15px',
                        paddingTop: '9px',
                    }}
                    onClick={() => setIsShowBaseInfo(false)}
                >
                    査定表
                </Button>
            </div>
            {assessment && (
                <div className='text-right my-3'>
                    {!isShowBaseInfo && (
                        <Button
                            variant='light'
                            className='bg-white border p-2 mx-2'
                            onClick={saveAssessmentStatementsIsOpen}
                        >
                            開閉状況を保存する
                        </Button>
                    )}
                    <Button
                        variant='light'
                        className='bg-white border p-2'
                        onClick={() =>
                            generateAssessment(contractable, assessment)
                        }
                    >
                        査定表をダウンロード
                    </Button>
                </div>
            )}
            {isShowBaseInfo || !assessment ? (
                <>
                    <Container fluid>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                契約番号
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {contract.contractNumber}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                契約日
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                <time>
                                    {contract.contractAt
                                        ? DateTime.fromJSDate(
                                              contract.contractAt,
                                          ).toFormat('yyyy年MM月dd日')
                                        : '---'}
                                </time>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                契約金額（税込）
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {contract.contractedPrice?.toLocaleString() ||
                                    '---'}
                                円
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                落札率
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {Math.floor(firstContract.rate * 10000) / 10000}
                            </Col>
                        </Row>
                        {contract.constructionId && (
                            <Row>
                                <Col
                                    sm='3'
                                    className='font-weight-bold border p-3'
                                >
                                    工事開始日
                                </Col>
                                <Col sm='9' className='border p-3 bg-white'>
                                    {contract.startAt
                                        ? DateTime.fromJSDate(
                                              contract.startAt,
                                          ).toFormat('yyyy年MM月dd日')
                                        : ''}
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                {contract.designId ? '完成期限' : '工事終了日'}
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {contract.endAt
                                    ? DateTime.fromJSDate(
                                          contract.endAt,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                {contract.designId ? '受注者' : '工事事業'}
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {suppliers.find(
                                    s => s.id === contract.supplierId,
                                )?.name || '-'}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                入札方式
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {firstContract.bidMethod || '-'}
                            </Col>
                        </Row>
                        {contract.designId && (
                            <>
                                <Row>
                                    <Col
                                        sm='3'
                                        className='font-weight-bold border p-3'
                                    >
                                        設計担当係長
                                    </Col>
                                    <Col sm='9' className='border p-3 bg-white'>
                                        {
                                            users.find(
                                                u =>
                                                    u.id ===
                                                    contract.designChiefId,
                                            )?.name
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        sm='3'
                                        className='font-weight-bold border p-3'
                                    >
                                        設計担当者
                                    </Col>
                                    <Col sm='9' className='border p-3 bg-white'>
                                        {
                                            users.find(
                                                u =>
                                                    u.id ===
                                                    contract.designStaffId,
                                            )?.name
                                        }
                                    </Col>
                                </Row>
                            </>
                        )}
                        {contract.constructionId && (
                            <>
                                <Row>
                                    <Col
                                        sm='3'
                                        className='font-weight-bold border p-3'
                                    >
                                        工事担当係長
                                    </Col>
                                    <Col sm='9' className='border p-3 bg-white'>
                                        {
                                            users.find(
                                                u =>
                                                    u.id ===
                                                    contract.constructionChiefId,
                                            )?.name
                                        }
                                    </Col>
                                </Row>
                                <Row>
                                    <Col
                                        sm='3'
                                        className='font-weight-bold border p-3'
                                    >
                                        工事担当者
                                    </Col>
                                    <Col sm='9' className='border p-3 bg-white'>
                                        {
                                            users.find(
                                                u =>
                                                    u.id ===
                                                    contract.constructionStaffId,
                                            )?.name
                                        }
                                    </Col>
                                </Row>
                            </>
                        )}
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                メモ
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                <p className='mb-0'>{contract.memo}</p>
                            </Col>
                        </Row>
                    </Container>
                    {contract.id === contractable.latestContract.id && (
                        <div className='text-right mt-4'>
                            <Link
                                href={`/contracts/${contract.id}/agreement?revise=true`}
                                passHref
                            >
                                <Button
                                    as='a'
                                    variant='light'
                                    className='bg-white border'
                                    disabled={
                                        !!contract.constructionId &&
                                        contract.nextAction !==
                                            'retirement_and_construction_in_progress'
                                    }
                                >
                                    修正
                                </Button>
                            </Link>
                        </div>
                    )}
                </>
            ) : (
                <AssessmentSheet
                    contractable={contractable}
                    contract={contract}
                    id={id}
                    assessment={assessment}
                    setAssessment={assessment => setAssessment(assessment)}
                />
            )}
        </div>
    );
};
