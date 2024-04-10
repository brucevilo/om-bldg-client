import React, { FormEventHandler, useEffect, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { Page, StaffSelector } from '@/Presentation/Component';
import { Button, Row, Col, Badge, Form, Navbar, Nav } from 'react-bootstrap';
import { Construction, Design } from '@/Domain/Entity';
import {
    ConstructionRepository,
    ContractRepository,
    DesignRepository,
} from '@/Domain/Repository';
import { useRouter } from 'next/router';
import { assertsIsExists } from '@/Infrastructure';
import Link from 'next/link';
import { Loading } from '@/Presentation/Component/Loading';

interface Props {
    id: number;
}

interface InquiryState {
    approvalNumber: string;
    inquiryMemo: string;
    inquiryById: number;
}

const ContractInquiryNew: NextPage<Props> = ({ id }) => {
    const [design, setDesign] = useState<Design>();
    const [construction, setConstruction] = useState<Construction>();

    const [inquiry, setInquiry] = useState<InquiryState>({
        approvalNumber: '',
        inquiryMemo: '',
        inquiryById: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const router = useRouter();
    const revise = !!router.query.revise;

    const fetchData = async () => {
        const contract = await ContractRepository.get(id);
        if (contract.designId)
            setDesign(await DesignRepository.get(contract.designId));
        if (contract.constructionId)
            setConstruction(
                await ConstructionRepository.get(contract.constructionId),
            );

        let firstApprovalNumberParams = {};
        // 設計変更の場合は工事稟議番号は元設計から自動設定する
        if (contract.designId) {
            const fetchedDesign = await DesignRepository.get(contract.designId);
            setDesign(fetchedDesign);
            firstApprovalNumberParams =
                fetchedDesign.contracts.length > 1
                    ? {
                          approvalNumber:
                              fetchedDesign.contracts[0].approvalNumber,
                      }
                    : {};
        }
        if (contract.constructionId) {
            const fetchedConstruction = await ConstructionRepository.get(
                contract.constructionId,
            );
            setConstruction(fetchedConstruction);
            firstApprovalNumberParams =
                fetchedConstruction.contracts.length > 1
                    ? {
                          approvalNumber:
                              fetchedConstruction.contracts[0].approvalNumber,
                      }
                    : {};
        }
        if (revise) {
            setInquiry(old => {
                return {
                    ...old,
                    approvalNumber:
                        contract.approvalNumber || old.approvalNumber,
                    inquiryMemo: contract.inquiryMemo || old.inquiryMemo,
                    inquiryById: contract.inquiryById || old.inquiryById,
                };
            });
        } else {
            setInquiry(old => {
                return {
                    ...old,
                    ...firstApprovalNumberParams,
                };
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (!design && !construction) return <Page>ロード中</Page>;

    const contract = design
        ? design.latestContract
        : construction?.latestContract;
    const isContractChanged = design
        ? design.isContractChanged
        : construction?.isContractChanged;
    assertsIsExists(contract);

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        const cnt = await ContractRepository.updateInquiry({
            id: contract.id as number,
            approvalNumber: inquiry.approvalNumber,
            inquiryAt: new Date(),
            inquiryMemo: inquiry.inquiryMemo,
            inquiryById: inquiry.inquiryById,
            // 修正の場合はnextActionを変更しない
            nextAction: revise ? contract.nextAction : undefined,
        });
        window.open(
            `${process.env.NEXT_PUBLIC_API_ORIGIN}${cnt.inquiryFileInfo?.path}`,
        );
        if (revise) {
            router.push(
                `/${design ? 'designs' : 'constructions'}/${
                    (design || construction)?.id
                }/contract_inquiry`,
            );
        } else {
            router.push(
                `/${
                    design ? 'designs' : 'constructions'
                }?next_action=agreement`,
            );
        }
    };

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href={design ? '/designs' : '/constructions'} passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>
                            {design ? '設計契約伺い' : '工事契約伺い'}
                        </span>
                        <small className='text-secondary'>
                            {design
                                ? `（${design.name}）`
                                : `（${construction?.name}）`}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section>
                <Form onSubmit={onSubmit}>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>
                                工事稟議番号
                            </span>
                        </Form.Label>
                        <Col sm='9'>
                            {isContractChanged ? (
                                <Form.Control
                                    value={inquiry.approvalNumber || ''}
                                    disabled
                                />
                            ) : (
                                <Form.Control
                                    placeholder='工事稟議番号を入力してください'
                                    value={inquiry.approvalNumber}
                                    onChange={e =>
                                        setInquiry({
                                            ...inquiry,
                                            approvalNumber: e.target.value,
                                        })
                                    }
                                    required
                                    disabled={isContractChanged}
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>登録者</span>
                        </Form.Label>
                        <Col sm='9'>
                            <StaffSelector
                                required
                                value={inquiry.inquiryById.toString()}
                                onChange={id =>
                                    setInquiry({
                                        ...inquiry,
                                        inquiryById: id,
                                    })
                                }
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>メモ</span>
                        </Form.Label>
                        <Col sm='9'>
                            <Form.Control
                                as='textarea'
                                rows={6}
                                placeholder='メモを入力してください'
                                value={inquiry.inquiryMemo}
                                onChange={e =>
                                    setInquiry({
                                        ...inquiry,
                                        inquiryMemo: e.target.value,
                                    })
                                }
                            />
                        </Col>
                    </Form.Group>
                    <div className='text-right'>
                        <Button
                            variant='light'
                            type='submit'
                            className='bg-white border'
                        >
                            登録してダウンロード
                        </Button>
                    </div>
                </Form>
            </section>
            {isLoading && <Loading />}
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            id: Number(params?.id),
        },
    };
};

export default ContractInquiryNew;
