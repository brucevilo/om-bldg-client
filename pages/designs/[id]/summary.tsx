import {
    ActionHistory,
    Construction,
    Contract,
    Design,
    DesignContractType,
} from '@/Domain/Entity';
import { DesignRepository } from '@/Domain/Repository';
import {
    Page,
    DesignDetailTabs,
    DesignActionButton,
    ActionHistoryList,
    EditDesignChiefModal,
    EditDesignStaffModal,
    ChangeDesignContractModal,
    ConstructionStatementHistoriesDetail,
} from '@/Presentation/Component';
import { MasterContext } from '@/Presentation/Context';
import { DateTime } from 'luxon';
import { GetServerSideProps, NextPage } from 'next';
import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Row, Table, Card } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';
import { DeleteContractChangeModal } from '@/Presentation/Component/ DeleteContractChangeModal';
import {
    getConstructionStatementHistoriesFromConstructions,
    ManageSheetService,
} from '@/App/Service';
import { faUpload, faDownload } from '@fortawesome/free-solid-svg-icons';
import Styles from '@/Presentation/Style/Components/ConstructionStatementsDetailPage.module.scss';
import { MigratedDesignSummary } from '@/Presentation/Component/MigratedDesign/MigratedDesignSummary';
import { useRouter } from 'next/router';

interface Props {
    id: number;
}
interface State {
    design: Design;
    contract: Contract;
    constructions: Construction[];
    actionHistories: ActionHistory[];
    showEditDesignChiefModal: boolean;
    showEditDesignStaffModal: boolean;
    showChangeContractModal: boolean;
}

const DesignSummary: NextPage<Props> = ({ id }) => {
    const router = useRouter();
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const [showDeleteContractChangeModal, setShowDeleteContractChangeModal] =
        useState<boolean>(false);

    const fetchData = async () => {
        const design = await DesignRepository.get(id);
        const actionHistories = await DesignRepository.getActionHistories(id);
        const constructions = await DesignRepository.getConstructions(id);
        setState({
            design,
            contract: design.latestContract,
            constructions,
            actionHistories,
            showEditDesignChiefModal: false,
            showEditDesignStaffModal: false,
            showChangeContractModal: false,
        });
    };

    useEffect(() => {
        fetchData();
    }, [showDeleteContractChangeModal]);

    const onUpload = async (file: File) => {
        await ManageSheetService.uploadForDesign(id, file);
        alert('工事管理シートの更新が完了しました');
        location.reload();
    };

    const { users, suppliers } = useContext(MasterContext);

    if (!state) return null;

    const { design, constructions, contract, actionHistories } = state;
    const isInternal = design.contractType === DesignContractType.Internal;

    const firstContract = design.contracts[0];

    const DefaultDesignSummary = () => (
        <Row>
            <Col md={6}>
                <h5 className='font-weight-bold mb-4'>ヒストリー</h5>
                <Card>
                    <Card.Body>
                        <h6 className='font-weight-bold mb-4'>NEXT ACTION</h6>
                        <div className='mb-4 d-flex'>
                            <DesignActionButton design={design} />
                            <Button
                                variant='link'
                                hidden={!contract.contractAt}
                                onClick={() => {
                                    if (contract.isProcessing) {
                                        alert('工事管理シート編集中です');
                                        return;
                                    }
                                    setState({
                                        ...state,
                                        showChangeContractModal: true,
                                    });
                                }}
                            >
                                契約変更
                            </Button>
                            {design.contracts.length > 1 && (
                                <Button
                                    variant='link'
                                    onClick={() => {
                                        if (contract.isProcessing) {
                                            alert('工事管理シート編集中です');
                                            return;
                                        }
                                        setShowDeleteContractChangeModal(true);
                                    }}
                                    className='text-danger'
                                >
                                    今回変更分を削除する
                                </Button>
                            )}
                        </div>
                        <ActionHistoryList actionHistories={actionHistories} />
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <h5 className='font-weight-bold mb-4'>基本情報</h5>
                <Card>
                    <Card.Body>
                        <Table hover>
                            <tbody>
                                <tr>
                                    <th className='w-25 border-0'>稟議番号</th>
                                    <td className='border-0'>
                                        {contract.approvalNumber || '---'}
                                    </td>
                                </tr>
                                <tr>
                                    <th className='border-0'>設計担当係長</th>
                                    <td className='border-0'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            {users.find(
                                                u =>
                                                    u.id ===
                                                    contract.designChiefId,
                                            )?.name || '---'}
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
                                        </div>
                                        <EditDesignChiefModal
                                            contract={contract}
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
                                    </td>
                                </tr>
                                <tr>
                                    <th className='border-0'>設計担当者</th>
                                    <td className='border-0'>
                                        <div className='d-flex justify-content-between align-items-center'>
                                            {users.find(
                                                u =>
                                                    u.id ===
                                                    contract?.designStaffId,
                                            )?.name || '-'}
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
                                {!isInternal && (
                                    <>
                                        <tr>
                                            <th className='border-0'>受注者</th>
                                            <td className='border-0'>
                                                {suppliers.find(
                                                    s =>
                                                        s.id ===
                                                        contract.supplierId,
                                                )?.name || '-'}
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
                                                    : '-'}
                                            </td>
                                        </tr>
                                    </>
                                )}
                                {isInternal ? (
                                    <>
                                        <tr>
                                            <th className='border-0'>
                                                設計開始日
                                            </th>
                                            <td className='border-0'>
                                                {firstContract.startAt
                                                    ? DateTime.fromJSDate(
                                                          firstContract.startAt,
                                                      ).toFormat(
                                                          'yyyy年MM月dd日',
                                                      )
                                                    : '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='border-0'>
                                                設計完了予定日
                                            </th>
                                            <td className='border-0'>
                                                {contract.expectedEndAt
                                                    ? DateTime.fromJSDate(
                                                          contract.expectedEndAt,
                                                      ).toFormat(
                                                          'yyyy年MM月dd日',
                                                      )
                                                    : '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='border-0'>
                                                積算持ち込み予定日
                                            </th>
                                            <td className='border-0'>
                                                {contract.endAt
                                                    ? DateTime.fromJSDate(
                                                          contract.endAt,
                                                      ).toFormat(
                                                          'yyyy年MM月dd日',
                                                      )
                                                    : '---'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='border-0'>
                                                工事契約予定日
                                            </th>
                                            <td className='border-0'>
                                                {contract.expectedConstructionOrderDateWhenDesigning
                                                    ? DateTime.fromJSDate(
                                                          contract.expectedConstructionOrderDateWhenDesigning,
                                                      ).toFormat(
                                                          'yyyy年MM月dd日',
                                                      )
                                                    : '---'}
                                            </td>
                                        </tr>
                                    </>
                                ) : (
                                    <>
                                        <tr>
                                            <th className='border-0'>契約日</th>
                                            <td className='border-0'>
                                                {firstContract.contractAt
                                                    ? DateTime.fromJSDate(
                                                          firstContract.contractAt,
                                                      ).toFormat(
                                                          'yyyy年MM月dd日',
                                                      )
                                                    : '-'}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className='border-0'>
                                                完成期限
                                            </th>
                                            <td className='border-0'>
                                                {design.latestContract.endAt
                                                    ? DateTime.fromJSDate(
                                                          design.latestContract
                                                              .endAt,
                                                      ).toFormat(
                                                          'yyyy年MM月dd日',
                                                      )
                                                    : '---'}
                                            </td>
                                        </tr>
                                    </>
                                )}
                                <tr>
                                    <th className='border-0'>工事管理シート</th>
                                    <td className='border-0'>
                                        {contract.manageSheetInfo?.filename ||
                                            '-'}
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
                            <Button
                                as={'a'}
                                href={
                                    (design.latestContract?.manageSheetInfo &&
                                        process.env.NEXT_PUBLIC_API_ORIGIN +
                                            design.latestContract
                                                ?.manageSheetInfo.path) ||
                                    ''
                                }
                                variant='light'
                                className='bg-white border mr-3'
                            >
                                <FA icon={faDownload} className='mr-2' />
                                工事管理シートをダウンロード
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
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
                    <MigratedDesignSummary
                        design={design}
                        firstContract={firstContract}
                        users={users}
                        suppliers={suppliers}
                        actionHistories={actionHistories}
                    />
                ) : (
                    <>
                        <DefaultDesignSummary />

                        <div className='my-4 d-flex justify-content-between'>
                            <div className={`${Styles.headers}`}>変更履歴</div>

                            <Button
                                variant='light'
                                className='bg-white border'
                                onClick={() => router.push('/change_schedule')}
                            >
                                変更予定
                            </Button>
                        </div>
                        <ConstructionStatementHistoriesDetail
                            csHistories={getConstructionStatementHistoriesFromConstructions(
                                constructions,
                            )}
                        />
                    </>
                )}
            </section>
            <ChangeDesignContractModal
                design={design}
                show={state.showChangeContractModal}
                onHide={() =>
                    setState({ ...state, showChangeContractModal: false })
                }
                onComplete={() => location.reload()}
            />
            <DeleteContractChangeModal
                show={showDeleteContractChangeModal}
                contractable={design}
                onHide={() => setShowDeleteContractChangeModal(false)}
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

export default DesignSummary;
