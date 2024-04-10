import { Contract, Design, DesignContractType } from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';
import {
    Page,
    DesignDetailTabs,
    ContractVersionTabs,
} from '@/Presentation/Component';
import { MasterContext } from '@/Presentation/Context';
import { DateTime } from 'luxon';
import { NextPage, GetServerSideProps } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';
import { MigratedDesignDetail } from '@/Presentation/Component/MigratedDesign/MigratedDesignDetail';
import { useRouter } from 'next/router';

interface Props {
    id: number;
    contractId: number | null;
}

const DesignDetails: NextPage<Props> = ({ id, contractId }) => {
    const [design, setDesign] = useState<Design>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const [currentContract, setCurrentContract] = useState<Contract>();
    const router = useRouter();
    const { users } = useContext(MasterContext);

    const fetchData = async () => {
        const design = await DesignRepository.get(id);
        const contract = contractId
            ? design.contracts.find(c => c.id === contractId)
            : design.latestContract;
        setDesign(design);
        setCurrentContract(contract);
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);
    if (!design || !currentContract) return null;

    const staff = users.find(
        u => u.id === design?.latestContract.designStaffId,
    );
    const chief = users.find(u => u.id === design.latestContract.designChiefId);
    const isInternal = design.contractType === DesignContractType.Internal;

    const DefaultComponent = () => (
        <>
            <Container fluid>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        設計名
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {design?.name}
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        設計書番号
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {design ? design.documentNumber?.dividedHyphen : ''}
                    </Col>
                </Row>
                {isInternal && (
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            設計担当係長
                        </Col>
                        <Col sm='9' className='border p-3 bg-white'>
                            {chief?.name}
                        </Col>
                    </Row>
                )}
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        設計担当者
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {staff?.name}
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        委託業者
                    </Col>
                    <Col
                        sm='9'
                        className='border p-3 bg-white d-flex justify-content-between'
                    >
                        {design?.contractType === DesignContractType.External
                            ? '外注'
                            : '内製'}
                    </Col>
                </Row>
                {!isInternal && (
                    <>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                設計委託仕様書
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract?.specFileInfo && (
                                    <a
                                        download
                                        href={
                                            process.env.NEXT_PUBLIC_API_ORIGIN +
                                            design.latestContract.specFileInfo
                                                .path
                                        }
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <FA icon={faFileAlt} className='mr-2' />
                                        {
                                            design.latestContract.specFileInfo
                                                .filename
                                        }
                                    </a>
                                )}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                予定価格
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                &yen;
                                {(design?.latestContract
                                    .isDisplayDistributedPrice &&
                                    design?.latestContract.expectedPrice?.toLocaleString()) ||
                                    '----'}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                契約日
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract.contractAt
                                    ? DateTime.fromJSDate(
                                          design.latestContract.contractAt,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                完成期限
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract.endAt
                                    ? DateTime.fromJSDate(
                                          design.latestContract.endAt,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                    </>
                )}
                {design?.contractType === DesignContractType.External ? (
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            本体工事発注予定日
                        </Col>
                        <Col sm='9' className='border p-3 bg-white'>
                            {design?.firstContract
                                .expectedConstructionOrderDateWhenDesigning
                                ? DateTime.fromJSDate(
                                      design.firstContract
                                          .expectedConstructionOrderDateWhenDesigning,
                                  ).toFormat('yyyy年MM月dd日')
                                : ''}
                        </Col>
                    </Row>
                ) : (
                    <>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                設計開始日
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract.startAt
                                    ? DateTime.fromJSDate(
                                          design.latestContract.startAt,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                設計完了予定日
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract.expectedEndAt
                                    ? DateTime.fromJSDate(
                                          design.latestContract.expectedEndAt,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                    </>
                )}
                {isInternal && (
                    <>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                積算持ち込み予定日
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract.endAt
                                    ? DateTime.fromJSDate(
                                          design.latestContract.endAt,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                        <Row>
                            <Col sm='3' className='font-weight-bold border p-3'>
                                工事契約予定日
                            </Col>
                            <Col sm='9' className='border p-3 bg-white'>
                                {design?.latestContract
                                    .expectedConstructionOrderDateWhenDesigning
                                    ? DateTime.fromJSDate(
                                          design.latestContract
                                              .expectedConstructionOrderDateWhenDesigning,
                                      ).toFormat('yyyy年MM月dd日')
                                    : ''}
                            </Col>
                        </Row>
                    </>
                )}
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        メモ
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        <p>{design?.memo}</p>
                    </Col>
                </Row>
            </Container>
            <div className='text-right mt-3'>
                <Link href={`/designs/${design.id}`} passHref>
                    <Button as='a' variant='light' className='bg-white border'>
                        編集する
                    </Button>
                </Link>
            </div>
        </>
    );

    return (
        <Page>
            <section>
                <DesignHeaderBreadcrumb
                    design={design}
                    displayDeleteButton={() =>
                        setDisplayDeleteButton(!displayDeleteButton)
                    }
                />
                <DesignDetailTabs
                    id={id}
                    design={design}
                    displayDeleteButton={displayDeleteButton}
                />
                {design.madeByMigration ? (
                    <>
                        <ContractVersionTabs
                            contractable={design}
                            currentContract={currentContract}
                            setCurrentContract={c =>
                                router.push(
                                    `/designs/${id}/details?contract_id=${c.id}`,
                                )
                            }
                        />
                        <MigratedDesignDetail
                            currentContract={currentContract}
                        />
                    </>
                ) : (
                    <DefaultComponent />
                )}
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
    query,
}) => {
    return {
        props: {
            id: Number(params?.id),
            contractId: Number(query.contract_id) || null,
        },
    };
};

export default DesignDetails;
