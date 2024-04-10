import React, {
    FormEventHandler,
    useEffect,
    useState,
    ChangeEvent,
    useContext,
} from 'react';
import { GetServerSideProps, NextPage } from 'next';
import {
    AssessmentModal,
    NumberInput,
    Page,
    StaffSelector,
    SupplierSelector,
    BidMethodSelector,
} from '@/Presentation/Component';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    Button,
    Form,
    Row,
    Col,
    Badge,
    Navbar,
    Nav,
    Accordion,
    AccordionCollapse,
    Card,
} from 'react-bootstrap';
import { faAngleDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import {
    Construction,
    Contract,
    Design,
    ConstructionStatement,
} from '@/Domain/Entity';
import {
    ConstructionRepository,
    ConstructionStatementRepository,
    ContractRepository,
    DesignRepository,
} from '@/Domain/Repository';
import { ManageSheetService } from '@/App/Service';
import { useRouter } from 'next/router';
import { Assessment, ContractRate } from '@/Domain/ValueObject';
import { assertsIsExists, assertsIsNotNull } from '@/Infrastructure';
import Link from 'next/link';
import { MasterContext } from '@/Presentation/Context';
import Head from 'next/head';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { fetchCostDocument } from '@/App/Service/fetchFiles';
import { CreateNewAssessmentService } from '@/Domain/Service';
import { AssetStatementRepository } from '@/Domain/Repository/AssetStatementRepository';
import { Loading } from '@/Presentation/Component/Loading';
import { dateToIsoDateString } from '@/Infrastructure/Date';
import { generateAssessment } from '@/App/Service/GenerateAssessmentSheet';

interface Props {
    id: number;
}
interface AgreementState {
    contractNumber: string;
    contractAt: Date | null;
    contractedPrice: string;
    endAt: Date | null;
    supplierId: number | null;
    bidMethod: string;
    designStaffId: number | null;
    designChiefId: number | null;
    constructionStaffId: number | null;
    constructionChiefId: number | null;
    memo: string;
}

const ContractAgreementNew: NextPage<Props> = ({ id }) => {
    const { users } = useContext(MasterContext);
    const [contract, setContract] = useState<Contract>();
    const [contractable, setContractable] = useState<Design | Construction>();
    const [showConstructionDropdown, setShowConstructionDropdown] =
        useState(true);
    const [agreement, setAgreement] = useState<AgreementState>({
        contractNumber: '',
        contractAt: null,
        contractedPrice: '',
        endAt: null,
        memo: '',
        supplierId: null,
        bidMethod: '',
        designStaffId: null,
        designChiefId: null,
        constructionStaffId: null,
        constructionChiefId: null,
    });
    const [manageSheet, setManageSheet] = useState<File>();
    const [statements, setStatements] = useState<ConstructionStatement[]>([]);
    const [showAssessmentModal, setShowAssessmentModal] = useState(false);
    const [assessment, setAssessment] = useState<Assessment>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingAssessment, setIsLoadingAssessment] =
        useState<boolean>(false);
    const router = useRouter();
    const revise = !!router.query.revise;
    const fetchAgreement = async (
        contract: Contract,
        contractable: Design | Construction,
    ) => {
        const costDocument = await fetchCostDocument(contract);
        const coverSheet = costDocument.coverSheet;
        const chiefId = coverSheet['I4']
            ? users.find(
                  u =>
                      u.name.replaceAll(/\s+/g, '') ===
                      coverSheet['I4'].v.replaceAll(/\s+/g, ''),
              )?.id
            : null;
        const staffId = coverSheet['I5']
            ? users.find(
                  u =>
                      u.name.replaceAll(/\s+/g, '') ===
                      coverSheet['I5'].v.replaceAll(/\s+/g, ''),
              )?.id
            : null;

        setAgreement({
            contractNumber:
                contractable.contracts.length > 1
                    ? contract.contractNumber ||
                      contractable.contracts[0].contractNumber ||
                      ''
                    : contract.contractNumber || '',
            contractAt: contract.contractAt,
            contractedPrice: contract.contractedPrice?.toString() || '',
            endAt:
                contractable.contracts.length > 1
                    ? contract.endAt || contractable.contracts[0].endAt
                    : contract.designId
                    ? contract.endAt
                    : contract.endAt || coverSheet['K6']
                    ? new Date(coverSheet['K6'].v)
                    : null,
            memo: contract.memo || '',
            supplierId:
                contract.supplierId || contractable.contracts[0].supplierId,
            bidMethod: contract.bidMethod,
            designStaffId:
                contractable.contracts.length > 1
                    ? contract.designStaffId ||
                      contractable.contracts[0].designStaffId
                    : contract.designStaffId || staffId || null,
            designChiefId:
                contractable.contracts.length > 1
                    ? contract.designChiefId ||
                      contractable.contracts[0].designChiefId
                    : contract.designChiefId || chiefId || null,
            constructionStaffId:
                contract.constructionStaffId ||
                contractable.contracts[0].constructionStaffId,
            constructionChiefId:
                contract.constructionChiefId ||
                contractable.contracts[0].constructionChiefId,
        });
        setIsLoading(false);
    };

    const fetchConstructionStatements = async (construction: Construction) => {
        const constructionStatements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                construction.latestContract.id,
            );
        setStatements(constructionStatements);
    };

    useEffect(() => {
        ContractRepository.get(id).then(contract => {
            setContract(contract);
            if (contract.designId)
                DesignRepository.get(contract.designId).then(design => {
                    setContractable(design);
                    fetchAgreement(contract, design);
                });
            if (contract.constructionId)
                ConstructionRepository.get(contract.constructionId).then(
                    construction => {
                        setContractable(construction);
                        fetchAgreement(contract, construction);
                        fetchConstructionStatements(construction);
                    },
                );
        });
    }, [users]);
    if (!contractable || !contract) return <Page>ロード中</Page>;

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();

        if (manageSheet && !manageSheet.name.includes('予定価格')) {
            alert('積算登録金額反映後の工事管理シートをご使用ください');
            return;
        }
        try {
            const assessment = await new CreateNewAssessmentService(
                contractable,
                new Contract({
                    ...contract,
                    contractedPrice: Number(agreement.contractedPrice),
                }),
            ).invoke();

            setAssessment(assessment);
            setShowAssessmentModal(true);
        } catch (e) {
            console.error(e);
            alert(
                '査定表の表示ができませんでした。端数調整に失敗した可能性があります。契約価格を確認してください',
            );
        }
    };
    const nextAction = revise
        ? contract.nextAction
        : contract.designId
        ? 'construction'
        : 'retirement_and_construction_in_progress';
    const onConfirmAssessment = async () => {
        setIsLoadingAssessment(true);
        const contractAt = agreement.contractAt;
        const endAt = agreement.endAt;
        if (!contractAt) {
            alert('契約日が入力されていません');
            return;
        }
        if (!endAt) {
            alert(
                `${
                    contract.designId ? '完成期限' : '工事工期'
                }が入力されていません`,
            );
            return;
        }
        await ContractRepository.updateAgreement({
            id: contract?.id as number,
            contractNumber: agreement.contractNumber,
            contractAt: contractAt,
            contractedPrice: Number(agreement.contractedPrice),
            endAt: endAt,
            memo: agreement.memo,
            supplierId: agreement.supplierId,
            bidMethod: agreement.bidMethod,
            designStaffId: agreement.designStaffId,
            designChiefId: agreement.designChiefId,
            constructionStaffId: agreement.constructionStaffId,
            constructionChiefId: agreement.constructionChiefId,
            nextAction,
        });

        if (!contract.designId) {
            assertsIsExists(
                contract.constructionId,
                'contract design id empty',
            );
            assertsIsNotNull(assessment);
            assertsIsExists(
                assessment.addedAssessmentPriceAssetStatements,
                '査定表計算済みのAssetStatementsがありません',
            );
            await AssetStatementRepository.updateByAssessment(
                assessment.addedAssessmentPriceAssetStatements,
            );
            await AssessmentStatementRepository.store(
                assessment.statements,
                contract.id,
            );

            if (!contract.isConstructionPeriodChanged && manageSheet) {
                await ManageSheetService.updateForAgreement(
                    contract.constructionId,
                    manageSheet,
                    revise,
                );
            }

            // Update construction statement terms
            if (contract.isConstructionPeriodChanged)
                await ConstructionStatementRepository.updateConstructionStatementsTermDate(
                    statements,
                );
        } else {
            assertsIsNotNull(assessment, 'Assessmentがありません');
            await AssessmentStatementRepository.update(assessment.statements);
            if (!contract.isConstructionPeriodChanged && manageSheet) {
                await ManageSheetService.updateForDesignAgreement(
                    contract.designId,
                    manageSheet,
                    revise,
                );
            }
        }

        generateAssessment(contractable, assessment);
        const contractablePath = contract.designId
            ? 'designs'
            : 'constructions';
        setIsLoadingAssessment(false);
        setShowAssessmentModal(false);
        if (revise) {
            router.push(`/${contractablePath}/${contractable.id}/contract`);
        } else {
            router.push(`/${contractablePath}?next_action=${nextAction}`);
        }
    };

    const setConstructionStatementTerm = (
        item: ConstructionStatement,
        value: string | Date,
    ) => {
        const newcs = new ConstructionStatement(
            item.id,
            item.contractId,
            item.name,
            item.projectCode,
            new Date(value),
            item.costItems,
            item.classification,
            item.isRetiremented,
            item.isConstructionInProgressCompleted,
            item.retirement,
            item.scheduledAcceptanceDate,
            item.isCollateral,
            item.previousConstructionStatementId,
            item.previousConstructionStatement,
            null,
            item.constructionStatementHistories,
            item.createdAt,
            item.updatedAt,
        );
        setStatements(
            statements.map(_cs => {
                if (newcs.id !== _cs.id) return _cs;
                return newcs;
            }),
        );
    };
    return (
        <Page>
            <Head>
                <title>査定表_{contractable.name}</title>
            </Head>
            <Navbar bg='white' className='px-5'>
                <Link
                    href={contract.designId ? '/designs' : '/constructions'}
                    passHref
                >
                    <Nav.Link className='text-dark font-weight-bold mr-4'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        <span className='mr-4'>
                            {contract.designId
                                ? '設計契約登録'
                                : '工事契約登録'}
                        </span>
                        <small className='text-secondary'>
                            {contractable.name}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section className='noPrint'>
                <Form onSubmit={onSubmit}>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            {contractable.contracts.length > 1 ? (
                                <Badge
                                    variant='light'
                                    className='mr-3 bg-white border'
                                >
                                    自動
                                </Badge>
                            ) : (
                                <Badge variant='danger' className='mr-3'>
                                    必須
                                </Badge>
                            )}
                            <span className='font-weight-bold'>契約番号</span>
                        </Form.Label>
                        <Col sm='9'>
                            <Form.Control
                                required
                                value={agreement.contractNumber}
                                onChange={e =>
                                    setAgreement({
                                        ...agreement,
                                        contractNumber: e.target.value,
                                    })
                                }
                                placeholder='契約番号を入力してください。'
                                disabled={contractable.contracts.length > 1}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>
                                {contractable.contracts.length > 1
                                    ? '変更契約日'
                                    : contract.designId
                                    ? '設計委託契約日'
                                    : '契約日'}
                            </span>
                        </Form.Label>
                        <Col sm='3'>
                            <Form.Control
                                required
                                type='date'
                                value={
                                    agreement.contractAt
                                        ? dateToIsoDateString(
                                              agreement.contractAt,
                                          )
                                        : undefined
                                }
                                onChange={e =>
                                    setAgreement({
                                        ...agreement,
                                        contractAt: new Date(e.target.value),
                                    })
                                }
                                max='3000-12-31'
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>
                                契約金額（税込）
                            </span>
                        </Form.Label>
                        <Col sm='9'>
                            <NumberInput
                                required
                                className='form-control'
                                value={agreement.contractedPrice}
                                max={contract.expectedPriceWithTax || undefined}
                                onChange={e => {
                                    setAgreement({
                                        ...agreement,
                                        contractedPrice: e,
                                    });
                                }}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge
                                variant='light'
                                className='mr-3 bg-white border'
                            >
                                自動
                            </Badge>
                            <span className='font-weight-bold'>
                                予定価格（税込）
                            </span>
                        </Form.Label>
                        <Col sm='9'>
                            <Form.Control
                                readOnly
                                value={
                                    contract?.expectedPriceWithTax?.toLocaleString() ||
                                    '-'
                                }
                                disabled
                            />
                        </Col>
                    </Form.Group>
                    {contractable.contracts.length === 1 && (
                        <Form.Group as={Row}>
                            <Form.Label column sm='3'>
                                <Badge
                                    variant='light'
                                    className='mr-3 bg-white border'
                                >
                                    自動
                                </Badge>
                                <span className='font-weight-bold'>落札率</span>
                            </Form.Label>
                            <Col sm='9'>
                                <Form.Control
                                    readOnly
                                    value={
                                        // 落札率の値表記
                                        contract?.expectedPriceWithTax &&
                                        agreement.contractedPrice
                                            ? Math.floor(
                                                  new ContractRate(
                                                      Number(
                                                          contract?.expectedPriceWithTax,
                                                      ),
                                                      Number(
                                                          agreement.contractedPrice,
                                                      ),
                                                  ).value * 10000,
                                              ) / 10000
                                            : '-'
                                    }
                                    disabled
                                />
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>
                                {contract.designId ? '完成期限' : '工事工期'}
                            </span>
                        </Form.Label>
                        <Col sm='3'>
                            <span className='font-weight-bold'>全体</span>
                            <Form.Control
                                type='date'
                                required
                                value={
                                    agreement.endAt
                                        ? dateToIsoDateString(agreement.endAt)
                                        : undefined
                                }
                                onChange={e =>
                                    setAgreement({
                                        ...agreement,
                                        endAt: new Date(e.target.value),
                                    })
                                }
                                max='3000-12-31'
                            />
                        </Col>
                    </Form.Group>
                    {contract.constructionId &&
                        contract.isConstructionPeriodChanged && (
                            <Form.Group as={Row}>
                                <Form.Label column sm='3'></Form.Label>
                                <Col sm='9'>
                                    <Accordion
                                        defaultActiveKey='1'
                                        className='rounded border'
                                        style={{
                                            backgroundColor: 'white',
                                            padding: '0px',
                                        }}
                                    >
                                        <Accordion.Toggle
                                            as={Card.Header}
                                            eventKey='1'
                                            onClick={() =>
                                                setShowConstructionDropdown(
                                                    !showConstructionDropdown,
                                                )
                                            }
                                            className='px-4'
                                            style={{
                                                backgroundColor: 'white',
                                            }}
                                        >
                                            <div className='d-flex justify-content-between align-items-center'>
                                                <div className='font-weight-bold'>
                                                    工事明細ごと
                                                </div>
                                                <FA
                                                    icon={
                                                        showConstructionDropdown
                                                            ? faChevronUp
                                                            : faAngleDown
                                                    }
                                                />
                                            </div>
                                        </Accordion.Toggle>
                                        <AccordionCollapse
                                            eventKey='1'
                                            as={Card.Body}
                                            className='px-4'
                                        >
                                            <>
                                                {statements?.map(
                                                    (item, index) => (
                                                        <div
                                                            className={`d-flex justify-content-between align-items-center py-2 ${
                                                                index !==
                                                                statements.length -
                                                                    1
                                                                    ? 'border-bottom'
                                                                    : ''
                                                            }`}
                                                            key={index}
                                                        >
                                                            <span className='font-weight-bold'>
                                                                {item.name}
                                                            </span>
                                                            <Col sm='6'>
                                                                <Form.Control
                                                                    type='date'
                                                                    required
                                                                    max='3000-12-31'
                                                                    style={{
                                                                        width: '50%',
                                                                    }}
                                                                    value={
                                                                        item.term
                                                                            ? dateToIsoDateString(
                                                                                  item.term,
                                                                              )
                                                                            : undefined
                                                                    }
                                                                    onChange={e =>
                                                                        setConstructionStatementTerm(
                                                                            item,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </Col>
                                                        </div>
                                                    ),
                                                )}
                                            </>
                                        </AccordionCollapse>
                                    </Accordion>
                                </Col>
                            </Form.Group>
                        )}

                    {contractable.contracts.length === 1 && (
                        <>
                            <Form.Group as={Row}>
                                <Form.Label column sm='3'>
                                    <Badge variant='danger' className='mr-3'>
                                        必須
                                    </Badge>
                                    <span className='font-weight-bold'>
                                        受注者
                                    </span>
                                </Form.Label>
                                <Col sm='9'>
                                    <SupplierSelector
                                        required
                                        value={
                                            agreement.supplierId?.toString() ||
                                            ''
                                        }
                                        onChange={(id: number) =>
                                            setAgreement({
                                                ...agreement,
                                                supplierId: id,
                                            })
                                        }
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm='3'>
                                    <Badge variant='danger' className='mr-3'>
                                        必須
                                    </Badge>
                                    <span className='font-weight-bold'>
                                        入札方式
                                    </span>
                                </Form.Label>
                                <Col sm='9'>
                                    <BidMethodSelector
                                        required
                                        value={
                                            agreement.bidMethod?.toString() ||
                                            ''
                                        }
                                        onChange={e =>
                                            setAgreement({
                                                ...agreement,
                                                bidMethod: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Form.Group>
                        </>
                    )}
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>
                                設計担当係長
                            </span>
                        </Form.Label>
                        <Col sm='5'>
                            <StaffSelector
                                required
                                value={
                                    agreement.designChiefId?.toString() || ''
                                }
                                onChange={id =>
                                    setAgreement({
                                        ...agreement,
                                        designChiefId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Control
                                readOnly
                                value={
                                    users.find(
                                        u => u.id === agreement.designChiefId,
                                    )?.department
                                }
                                disabled
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='danger' className='mr-3'>
                                必須
                            </Badge>
                            <span className='font-weight-bold'>設計担当者</span>
                        </Form.Label>
                        <Col sm='5'>
                            <StaffSelector
                                required
                                value={
                                    agreement.designStaffId?.toString() || ''
                                }
                                onChange={id =>
                                    setAgreement({
                                        ...agreement,
                                        designStaffId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Control
                                readOnly
                                value={
                                    users.find(
                                        u => u.id === agreement.designStaffId,
                                    )?.department
                                }
                                disabled
                            />
                        </Col>
                    </Form.Group>
                    {contract.constructionId && (
                        <>
                            <Form.Group as={Row}>
                                <Form.Label column sm='3'>
                                    <Badge variant='danger' className='mr-3'>
                                        必須
                                    </Badge>
                                    <span className='font-weight-bold'>
                                        工事担当係長
                                    </span>
                                </Form.Label>
                                <Col sm='5'>
                                    <StaffSelector
                                        required
                                        value={
                                            agreement.constructionChiefId?.toString() ||
                                            ''
                                        }
                                        onChange={id =>
                                            setAgreement({
                                                ...agreement,
                                                constructionChiefId: id,
                                            })
                                        }
                                    />
                                </Col>
                                <Col sm='4'>
                                    <Form.Control
                                        readOnly
                                        value={
                                            users.find(
                                                u =>
                                                    u.id ===
                                                    agreement.constructionChiefId,
                                            )?.department
                                        }
                                        disabled
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm='3'>
                                    <Badge variant='danger' className='mr-3'>
                                        必須
                                    </Badge>
                                    <span className='font-weight-bold'>
                                        工事担当者
                                    </span>
                                </Form.Label>
                                <Col sm='5'>
                                    <StaffSelector
                                        required
                                        value={
                                            agreement.constructionStaffId?.toString() ||
                                            ''
                                        }
                                        onChange={id =>
                                            setAgreement({
                                                ...agreement,
                                                constructionStaffId: id,
                                            })
                                        }
                                    />
                                </Col>
                                <Col sm='4'>
                                    <Form.Control
                                        readOnly
                                        value={
                                            users.find(
                                                u =>
                                                    u.id ===
                                                    agreement.constructionStaffId,
                                            )?.department
                                        }
                                        disabled
                                    />
                                </Col>
                            </Form.Group>
                        </>
                    )}
                    {contract.isConstructionPeriodChanged || (
                        <Form.Group as={Row}>
                            <Form.Label column sm='3'>
                                <Badge variant='danger' className='mr-3'>
                                    必須
                                </Badge>
                                <span className='font-weight-bold'>
                                    工事管理シート
                                </span>
                            </Form.Label>
                            <Col sm='9'>
                                <Form.File.Input
                                    required
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>,
                                    ) =>
                                        e.target.files &&
                                        setManageSheet(e.target.files[0])
                                    }
                                />
                            </Col>
                        </Form.Group>
                    )}
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
                                value={agreement.memo}
                                onChange={e =>
                                    setAgreement({
                                        ...agreement,
                                        memo: e.target.value,
                                    })
                                }
                            />
                        </Col>
                    </Form.Group>
                    <div className='text-right'>
                        <Button
                            type='submit'
                            variant='light'
                            className='bg-white border'
                        >
                            登録して工事管理シートを更新する
                        </Button>
                    </div>
                </Form>
            </section>
            {agreement.contractedPrice && showAssessmentModal && assessment && (
                <AssessmentModal
                    contractable={contractable}
                    contract={
                        new Contract({
                            /* 査定表の計算に必要なcontractedPriceだけ渡しておく */
                            ...contract,
                            contractedPrice: Number(agreement.contractedPrice),
                        })
                    }
                    show={showAssessmentModal}
                    onHide={() => setShowAssessmentModal(false)}
                    onComplete={onConfirmAssessment}
                    assessment={assessment}
                    setAssessment={(assessment: Assessment) =>
                        setAssessment(assessment)
                    }
                    isLoadingAssessment={isLoadingAssessment}
                />
            )}
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

export default ContractAgreementNew;
