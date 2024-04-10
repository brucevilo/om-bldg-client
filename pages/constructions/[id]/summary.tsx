import React, {
    useState,
    useEffect,
    FC,
    FormEventHandler,
    useContext,
} from 'react';
import { NextPage, GetServerSideProps } from 'next';
import {
    Page,
    ConstructionTabWrapper,
    ConstructionActionButton,
    ActionHistoryList,
    ChangeConstructionContractModal,
    EditConstructionStaffModal,
    EditConstructionChiefModal,
    EditDesignStaffModal,
    EditDesignChiefModal,
    ChangeConstructionPeriodModal,
} from '@/Presentation/Component';
import {
    ActionHistory,
    Construction,
    ConstructionStatement,
    Contract,
    Design,
} from '@/Domain/Entity';
import {
    ConstructionRepository,
    ConstructionStatementRepository,
    DesignRepository,
} from '@/Domain/Repository';
import { Row, Col, Button, Table, Modal, Form, Card } from 'react-bootstrap';
import { ManageSheetService } from '@/App/Service';
import { DateTime } from 'luxon';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faDownload,
    faEdit,
    faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { assertsIsNotNull } from '@/Infrastructure';
import { MasterContext } from '@/Presentation/Context';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { EditDocumentNumberModal } from '@/Presentation/Component/EditDocumentNumberModal';
import { RegistrationScheduledAcceptanceDateModal } from '@/Presentation/Component/RegistrationScheduledAcceptanceDateModal';
import { useRouter } from 'next/router';
import { isNeedScheduledAcceptanceDate } from '@/Domain/Service/ IsNeedScheduledAcceptanceDate';
import { AllScheduledAcceptanceDateRegistrationModal } from '@/Presentation/Component/AllScheduledAcceptanceDateRegistrationModal';
import { xorBy } from 'lodash';
import { DeleteContractChangeModal } from '@/Presentation/Component/ DeleteContractChangeModal';
import { isDeletableContractChange } from '@/App/Service/IsDeletableContractChange';
import { MigratedConstructionSummary } from '@/Presentation/Component/MigratedConstruction/MigratedConstructionSummary';
import Link from 'next/link';
interface Props {
    id: number;
}

interface State {
    construction: Construction;
    contract: Contract;
    statements: ConstructionStatement[];
    showChangeContractModal: boolean;
    showEditDesignStaffModal: boolean;
    showEditConstructionStaffModal: boolean;
    showEditConstructionChiefModal: boolean;
    showEditDocumentNumberModal: boolean;
    showEditDesignChiefModal: boolean;
    actionHistories: ActionHistory[];
    designs: Design[];
    showChangeConstructionPeriodModal: boolean;
}

const ConstructionStatementStatus: FC<{
    constructionStatement: ConstructionStatement;
    selectConstructionStatements: ConstructionStatement[] | null;
    setSelectConstructionStatements: React.Dispatch<
        React.SetStateAction<[] | ConstructionStatement[]>
    >;
    contract: Contract;
}> = ({
    constructionStatement,
    selectConstructionStatements,
    setSelectConstructionStatements,
    contract,
}) => {
    const [showModal, setShowModal] = useState(false);
    const [date, setDate] = useState('');
    useEffect(() => {
        setDate(
            constructionStatement.scheduledAcceptanceDate
                ? DateTime.fromJSDate(
                      constructionStatement.scheduledAcceptanceDate,
                  ).toFormat('yyyy-MM-dd')
                : '',
        );
    }, [constructionStatement.scheduledAcceptanceDate]);
    const onSubmit: FormEventHandler = async e => {
        try {
            e.preventDefault();
            if (!contract.ownerId) {
                throw new Error('工事の作成者が紐付いておりません');
            }
            assertsIsNotNull(constructionStatement.id);
            await ConstructionStatementRepository.updateScheduledAcceptanceDate(
                constructionStatement.id,
                date,
            );
            location.reload();
        } catch (e) {
            if (e instanceof Error) {
                alert(e.message);
            }
        }
    };
    return (
        <div className='border rounded bg-white p-3 d-flex flex-column mb-4'>
            <div className='d-flex'>
                <Form.Check
                    id={String(constructionStatement.id)}
                    onChange={() =>
                        setSelectConstructionStatements(
                            xorBy(
                                selectConstructionStatements,
                                [constructionStatement],
                                'id',
                            ),
                        )
                    }
                    checked={selectConstructionStatements?.some(
                        cs => cs.id === constructionStatement.id,
                    )}
                />
                <div className='flex-grow-1 font-weight-bold'>
                    <Link
                        href={`/construction_statements/${constructionStatement.id}`}
                        passHref
                    >
                        {constructionStatement.name}
                    </Link>
                </div>
                <Button
                    className='bg-white border text-dark'
                    onClick={() => setShowModal(true)}
                >
                    編集
                </Button>
            </div>
            <div className='d-flex'>
                <div className='text-right mr-3'>
                    工事工期:
                    {DateTime.fromJSDate(constructionStatement.term).toFormat(
                        'yyyy/MM/dd',
                    )}
                </div>
                <div className='text-right mr-3'>
                    検収予定日:
                    {constructionStatement.scheduledAcceptanceDate
                        ? DateTime.fromJSDate(
                              constructionStatement.scheduledAcceptanceDate,
                          ).toFormat('yyyy/MM/dd')
                        : '---'}
                </div>
                <div className='text-right mr-3'>
                    {constructionStatement.totalPrice.toLocaleString()}円
                </div>
            </div>
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header>
                    <Modal.Title>工事編集</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={onSubmit}>
                        <Form.Group>
                            <Form.Label>検収予定日</Form.Label>
                            <Form.Control
                                required
                                placeholder='検収予定日を入力してください'
                                type='date'
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                min='1900-01-01'
                                max='3000-01-01'
                            />
                        </Form.Group>
                        <div className='text-right'>
                            <Button
                                type='submit'
                                variant='light'
                                className='bg-white border'
                            >
                                確定
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

const ConstructionSummary: NextPage<Props> = ({ id }) => {
    const { users, suppliers } = useContext(MasterContext);
    const router = useRouter();
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const [selectConstructionStatements, setSelectConstructionStatements] =
        useState<ConstructionStatement[] | []>([]);
    const [
        showAllScheduledAcceptanceDateRegistrationModal,
        setShowAllScheduledAcceptanceDateRegistrationModal,
    ] = useState<boolean>(false);
    const [showDeleteContractChangeModal, setShowDeleteContractChangeModal] =
        useState<boolean>(false);

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        const statements =
            await ConstructionStatementRepository.listByConstruction(
                id,
                construction.latestContract.id,
            );
        const actionHistories = await ConstructionRepository.getActionHistories(
            id,
        );
        const designs = await DesignRepository.listByConstruction(construction);
        setState({
            construction,
            statements,
            contract: construction.latestContract,
            showChangeContractModal: false,
            showEditDesignStaffModal: false,
            showEditConstructionChiefModal: false,
            showEditConstructionStaffModal: false,
            showEditDocumentNumberModal: false,
            showEditDesignChiefModal: false,
            actionHistories,
            designs,
            showChangeConstructionPeriodModal: false,
        });
    };

    const onUpload = async (file: File) => {
        await ManageSheetService.upload(id, file);
        alert('工事管理シートの更新が完了しました');
        location.reload();
    };

    useEffect(() => {
        fetchData();
    }, [
        router.query.registration_scheduled_acceptance_date,
        showAllScheduledAcceptanceDateRegistrationModal,
        showDeleteContractChangeModal,
    ]);

    if (!state) return null;

    const {
        contract,
        construction,
        statements,
        showChangeContractModal,
        actionHistories,
        designs,
    } = state;

    const firstContract = construction.contracts[0];
    const isDesignExist = designs.length > 0;

    const DefaultConstructionSummary = () => (
        <>
            <Row className='mb-5'>
                <Col>
                    <h5 className='font-weight-bold mb-4'>ヒストリー</h5>
                    <Card>
                        <Card.Body>
                            {contract.nextAction !== 'completed' && (
                                <>
                                    <h6 className='font-weight-bold mb-4'>
                                        NEXT ACTION
                                    </h6>
                                    <div className='d-flex mb-4'>
                                        <ConstructionActionButton
                                            construction={construction}
                                        />
                                        {contract.contractAt &&
                                            !statements.some(
                                                s =>
                                                    s.isConstructionInProgressCompleted ||
                                                    s.isRetiremented,
                                            ) && (
                                                <>
                                                    <Button
                                                        variant='link'
                                                        onClick={() => {
                                                            if (
                                                                contract.isProcessing
                                                            ) {
                                                                alert(
                                                                    '工事管理シート編集中です',
                                                                );
                                                                return;
                                                            }
                                                            setState({
                                                                ...state,
                                                                showChangeContractModal:
                                                                    true,
                                                            });
                                                        }}
                                                    >
                                                        契約変更
                                                    </Button>
                                                    <Button
                                                        variant='link'
                                                        onClick={() => {
                                                            if (
                                                                contract.isProcessing
                                                            ) {
                                                                alert(
                                                                    '工事管理シート編集中です',
                                                                );
                                                                return;
                                                            }
                                                            setState({
                                                                ...state,
                                                                showChangeConstructionPeriodModal:
                                                                    true,
                                                            });
                                                        }}
                                                    >
                                                        工事工期変更
                                                    </Button>
                                                </>
                                            )}

                                        {isDeletableContractChange(
                                            construction,
                                            statements,
                                        ) && (
                                            <Button
                                                variant='link'
                                                onClick={() =>
                                                    setShowDeleteContractChangeModal(
                                                        true,
                                                    )
                                                }
                                                className='text-danger'
                                            >
                                                今回変更分を削除する
                                            </Button>
                                        )}
                                    </div>
                                </>
                            )}
                            <ActionHistoryList
                                actionHistories={actionHistories}
                            />
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <h5 className='font-weight-bold mb-4'>基本情報</h5>
                    <Card>
                        <Card.Body>
                            <Table hover>
                                <tbody>
                                    <tr>
                                        <th className='w-25 border-0'>
                                            稟議番号
                                        </th>
                                        <td className='border-0'>
                                            {contract.approvalNumber || '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>設計書番号</th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {
                                                    construction.documentNumber
                                                        .dividedHyphen
                                                }
                                                <Button
                                                    variant='light'
                                                    className='bg-white border-0'
                                                    onClick={() =>
                                                        setState({
                                                            ...state,
                                                            showEditDocumentNumberModal:
                                                                true,
                                                        })
                                                    }
                                                >
                                                    <FA icon={faEdit} />
                                                </Button>
                                            </div>
                                            <EditDocumentNumberModal
                                                construction={construction}
                                                show={
                                                    state.showEditDocumentNumberModal
                                                }
                                                onHide={() =>
                                                    setState({
                                                        ...state,
                                                        showEditDocumentNumberModal:
                                                            false,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            設計担当係長
                                        </th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        designs[0]
                                                            ?.latestContract
                                                            .designChiefId,
                                                )?.name || '---'}
                                                {isDesignExist && (
                                                    <Button
                                                        variant='light'
                                                        className='bg-white border-0'
                                                        onClick={() =>
                                                            setState({
                                                                ...state,
                                                                showEditDesignChiefModal:
                                                                    true,
                                                            })
                                                        }
                                                    >
                                                        <FA icon={faEdit} />
                                                    </Button>
                                                )}
                                            </div>
                                            {isDesignExist && (
                                                <EditDesignChiefModal
                                                    contract={
                                                        designs[0]
                                                            .latestContract
                                                    }
                                                    show={
                                                        state.showEditDesignChiefModal
                                                    }
                                                    onHide={() =>
                                                        setState({
                                                            ...state,
                                                            showEditDesignChiefModal:
                                                                false,
                                                        })
                                                    }
                                                />
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>設計担当者</th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        contract.designStaffId,
                                                )?.name || '---'}
                                                <Button
                                                    variant='light'
                                                    className='bg-white border-0'
                                                    onClick={() =>
                                                        setState({
                                                            ...state,
                                                            showEditDesignStaffModal:
                                                                true,
                                                        })
                                                    }
                                                >
                                                    <FA icon={faEdit} />
                                                </Button>
                                            </div>
                                            <EditDesignStaffModal
                                                contract={contract}
                                                show={
                                                    state.showEditDesignStaffModal
                                                }
                                                onHide={() =>
                                                    setState({
                                                        ...state,
                                                        showEditDesignStaffModal:
                                                            false,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            工事担当係長
                                        </th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        contract.constructionChiefId,
                                                )?.name || '---'}
                                                <Button
                                                    variant='light'
                                                    className='bg-white border-0'
                                                    onClick={() =>
                                                        setState({
                                                            ...state,
                                                            showEditConstructionChiefModal:
                                                                true,
                                                        })
                                                    }
                                                >
                                                    <FA icon={faEdit} />
                                                </Button>
                                            </div>
                                            <EditConstructionChiefModal
                                                contract={contract}
                                                show={
                                                    state.showEditConstructionChiefModal
                                                }
                                                onHide={() =>
                                                    setState({
                                                        ...state,
                                                        showEditConstructionChiefModal:
                                                            false,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>工事担当者</th>
                                        <td className='border-0'>
                                            <div className='d-flex justify-content-between align-items-center'>
                                                {users.find(
                                                    u =>
                                                        u.id ===
                                                        contract.constructionStaffId,
                                                )?.name || '---'}
                                                <Button
                                                    variant='light'
                                                    className='bg-white border-0'
                                                    onClick={() =>
                                                        setState({
                                                            ...state,
                                                            showEditConstructionStaffModal:
                                                                true,
                                                        })
                                                    }
                                                >
                                                    <FA icon={faEdit} />
                                                </Button>
                                            </div>
                                            <EditConstructionStaffModal
                                                contract={contract}
                                                show={
                                                    state.showEditConstructionStaffModal
                                                }
                                                onHide={() =>
                                                    setState({
                                                        ...state,
                                                        showEditConstructionStaffModal:
                                                            false,
                                                    })
                                                }
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>受注者名</th>
                                        <td className='border-0'>
                                            {suppliers.find(
                                                s =>
                                                    s.id ===
                                                    contract.supplierId,
                                            )?.name || '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            当初予定価格（税抜）
                                        </th>
                                        <td className='border-0'>
                                            {firstContract.isDisplayDistributedPrice
                                                ? firstContract.expectedPrice?.toLocaleString()
                                                : '---'}
                                            円
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            当初契約金額（税抜）
                                        </th>
                                        <td className='border-0'>
                                            {firstContract.contractedPriceWithoutTax.toLocaleString() ||
                                                '---'}
                                            円
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            最終契約金額（税抜）
                                        </th>
                                        <td className='border-0'>
                                            {contract.contractedPriceWithoutTax.toLocaleString() ||
                                                '---'}
                                            円
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>落札率</th>
                                        <td className='border-0'>
                                            {firstContract.rate
                                                ? Math.floor(
                                                      firstContract.rate *
                                                          10000,
                                                  ) / 10000
                                                : '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>契約日</th>
                                        <td className='border-0'>
                                            {firstContract.contractAt
                                                ? DateTime.fromJSDate(
                                                      firstContract.contractAt,
                                                  ).toFormat('yyyy年MM月dd日')
                                                : '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>工事工期</th>
                                        <td className='border-0'>
                                            {contract.endAt
                                                ? DateTime.fromJSDate(
                                                      contract.endAt,
                                                  ).toFormat('yyyy年MM月dd日')
                                                : '---'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='border-0'>
                                            工事管理シート
                                        </th>
                                        <td className='border-0'>
                                            {contract.manageSheetInfo
                                                ?.filename || '----'}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>
                            <div className='text-right'>
                                <label
                                    className='btn btn-primary bg-white border text-dark mr-3'
                                    htmlFor='upload-manage-sheet'
                                >
                                    <input
                                        id='upload-manage-sheet'
                                        className='form-control-file d-none'
                                        type='file'
                                        required
                                        onChange={e =>
                                            e.target.files &&
                                            e.target.files[0] &&
                                            onUpload(e.target.files[0])
                                        }
                                    />
                                    <FA icon={faUpload} className='mr-2' />
                                    工事管理シートをアップロード
                                </label>
                                <a
                                    href={
                                        (construction.latestContract
                                            ?.manageSheetInfo &&
                                            process.env.NEXT_PUBLIC_API_ORIGIN +
                                                construction.latestContract
                                                    ?.manageSheetInfo.path) ||
                                        ''
                                    }
                                    className='btn btn-primary bg-white border text-dark mb-2'
                                    style={
                                        construction.latestContract
                                            ?.manageSheetInfo
                                            ? {}
                                            : {
                                                  opacity: '0.5',
                                                  pointerEvents: 'none',
                                              }
                                    }
                                >
                                    <FA icon={faDownload} className='mr-2' />
                                    工事管理シートをダウンロード
                                </a>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <h5 className='font-weight-bold mb-4'>工事ステータス</h5>
            {statements.map(s => (
                <ConstructionStatementStatus
                    key={s.id}
                    constructionStatement={s}
                    selectConstructionStatements={selectConstructionStatements}
                    setSelectConstructionStatements={
                        setSelectConstructionStatements
                    }
                    contract={contract}
                />
            ))}
            <div className='text-right'>
                <Button
                    className='bg-white border text-dark'
                    onClick={() =>
                        setShowAllScheduledAcceptanceDateRegistrationModal(true)
                    }
                    disabled={selectConstructionStatements.length === 0}
                >
                    検収予定日をまとめて入力する
                </Button>
            </div>
        </>
    );
    return (
        <Page>
            <section>
                <ConstructionHeaderBreadcrumb
                    construction={construction}
                    displayDeleteButton={() =>
                        setDisplayDeleteButton(!displayDeleteButton)
                    }
                />
                <ConstructionTabWrapper
                    id={id}
                    construction={construction}
                    displayDeleteButton={displayDeleteButton}
                />
                {construction.madeByMigration ? (
                    <MigratedConstructionSummary
                        construction={construction}
                        statements={statements}
                        firstContract={firstContract}
                        lastContractedPrice={
                            construction.contracts.reverse()[0]
                                .contractedPrice || 0
                        }
                        users={users}
                        suppliers={suppliers}
                        actionHistories={actionHistories}
                    />
                ) : (
                    <DefaultConstructionSummary />
                )}
            </section>
            <ChangeConstructionContractModal
                show={showChangeContractModal}
                onHide={() =>
                    setState({ ...state, showChangeContractModal: false })
                }
                construction={construction}
                onComplete={() => {
                    fetchData();
                    setState({ ...state, showChangeContractModal: false });
                }}
            />
            <RegistrationScheduledAcceptanceDateModal
                show={
                    router.query.registration_scheduled_acceptance_date ===
                    'true'
                }
                construction={construction}
                constructionStatements={isNeedScheduledAcceptanceDate(
                    statements,
                )}
                onHide={() =>
                    router.push(`/constructions/${construction.id}/summary`)
                }
            />
            {selectConstructionStatements && (
                <AllScheduledAcceptanceDateRegistrationModal
                    show={showAllScheduledAcceptanceDateRegistrationModal}
                    onHide={() =>
                        setShowAllScheduledAcceptanceDateRegistrationModal(
                            false,
                        )
                    }
                    constructionStatements={selectConstructionStatements}
                    setConstructionStatements={setSelectConstructionStatements}
                    contract={contract}
                />
            )}
            <DeleteContractChangeModal
                show={showDeleteContractChangeModal}
                contractable={construction}
                onHide={() => setShowDeleteContractChangeModal(false)}
            />
            <ChangeConstructionPeriodModal
                construction={construction}
                statements={statements}
                show={state.showChangeConstructionPeriodModal}
                onHide={() =>
                    setState({
                        ...state,
                        showChangeConstructionPeriodModal: false,
                    })
                }
                onComplete={() => location.reload()}
            />
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

export default ConstructionSummary;
