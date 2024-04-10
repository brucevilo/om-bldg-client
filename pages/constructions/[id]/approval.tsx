import {
    Page,
    ConstructionTabWrapper,
    ContractVersionTabs,
    ConstructionActionButton,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, { useState, useEffect, FormEventHandler } from 'react';
import { Construction, Contract } from '@/Domain/Entity';
import {
    ConstructionRepository,
    ContractRepository,
} from '@/Domain/Repository';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Button,
    Modal,
    Badge,
} from 'react-bootstrap';
import { useRouter } from 'next/router';
import { assertsIsExists } from '@/Infrastructure';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import ConstructionHeaderBreadcrumb from '@/Presentation/Component/ConstructionHeaderBreadcrumb';
import { ContractNextActionNumber } from '@/App/Service/ContractNextActionToNumber';
interface Props {
    id: number;
}
interface State {
    construction: Construction;
    approvalFile: File | null;
    approvalMemo: string;
    showModal: boolean;
    specFile: File | null;
}

const ConstructionApproval: NextPage<Props> = ({ id }) => {
    const router = useRouter();
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const fetchData = async () => {
        const construction = await ConstructionRepository.get(id);
        setState({
            construction,
            approvalFile: null,
            approvalMemo: '',
            showModal: false,
            specFile: null,
        });
    };

    const onChangeContract = (c: Contract) => {
        router.push(`/constructions/${id}/approval?contract_id=${c.id}`);
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    if (!state) return null;

    const { construction, showModal, approvalFile, approvalMemo, specFile } =
        state;
    const contract = router.query.contract_id
        ? construction.contracts.find(
              c => c.id === Number(router.query.contract_id),
          )
        : construction.latestContract;
    assertsIsExists(contract);
    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        if (!approvalFile || !specFile) return;
        await ContractRepository.updateApproval({
            id: contract.id,
            approvalFile,
            approvalMemo,
            // ファイルの更新だけなのでnextActionは更新しない
            nextAction: contract.nextAction,
            specFile,
        });
        fetchData();
    };
    const contents = construction.madeByMigration ? (
        <Container fluid>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    工事稟議書
                </Col>
                <Col
                    sm='9'
                    className='border p-3 bg-white d-flex justify-content-between'
                >
                    {contract.approvalFileInfo && (
                        <a
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                contract.approvalFileInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FA icon={faFileAlt} className='mr-2' />
                            {contract.approvalFileInfo.filename}
                        </a>
                    )}
                </Col>
            </Row>
        </Container>
    ) : ContractNextActionNumber[contract.nextAction] <
      ContractNextActionNumber.inquiry ? (
        <Card>
            <Card.Body>
                <div className='d-flex justify-content-between'>
                    {ContractNextActionNumber[contract.nextAction] ===
                    ContractNextActionNumber.approval ? (
                        <>
                            <span>設計書・稟議が登録されていません</span>
                            <ConstructionActionButton
                                construction={construction}
                            />
                        </>
                    ) : (
                        <span>
                            積算が登録されていません。先に前のプロセスを行ってください。
                        </span>
                    )}
                </div>
            </Card.Body>
        </Card>
    ) : (
        <Container fluid>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    設計書
                </Col>
                <Col
                    sm='9'
                    className='border p-3 bg-white d-flex justify-content-between'
                >
                    {contract.specFileInfo && (
                        <a
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                contract.specFileInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FA icon={faFileAlt} className='mr-2' />
                            {contract.specFileInfo.filename}
                        </a>
                    )}
                </Col>
            </Row>
            <Row>
                <Col sm='3' className='font-weight-bold border p-3'>
                    工事稟議書
                </Col>
                <Col
                    sm='9'
                    className='border p-3 bg-white d-flex justify-content-between'
                >
                    {contract.approvalFileInfo && (
                        <a
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                contract.approvalFileInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FA icon={faFileAlt} className='mr-2' />
                            {contract.approvalFileInfo.filename}
                        </a>
                    )}
                </Col>
            </Row>
            <Row className='mb-4'>
                <Col sm='3' className='font-weight-bold border p-3'>
                    メモ
                </Col>
                <Col sm='9' className='border p-3 bg-white'>
                    {contract.approvalMemo}
                </Col>
            </Row>
            <Row>
                <Col>
                    {contract.id === construction.latestContract.id && (
                        <div className='text-right'>
                            <Button
                                variant='light'
                                className='bg-white border'
                                disabled={contract.nextAction !== 'inquiry'}
                                onClick={() =>
                                    setState({
                                        ...state,
                                        showModal: true,
                                    })
                                }
                            >
                                再アップロード
                            </Button>
                        </div>
                    )}
                </Col>
            </Row>
            <Modal
                show={showModal}
                onHide={() => setState({ ...state, showModal: false })}
            >
                <Modal.Header>
                    <Modal.Title>
                        <span className='d-block'>
                            設計書・稟議書アップロード
                        </span>
                        <small className='text-secondary'>
                            {construction.name}
                        </small>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={onSubmit}>
                        <Form.Group>
                            <Form.Label>
                                <Badge variant='danger'>必須</Badge>
                                設計書
                            </Form.Label>
                            <input
                                type='file'
                                className='form-control-file'
                                onChange={e => {
                                    if (!e.target.files) return;
                                    setState({
                                        ...state,
                                        specFile: e.target.files[0],
                                    });
                                }}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>
                                <Badge variant='danger'>必須</Badge>
                                稟議書
                            </Form.Label>
                            <input
                                type='file'
                                className='form-control-file'
                                onChange={e => {
                                    if (!e.target.files) return;
                                    setState({
                                        ...state,
                                        approvalFile: e.target.files[0],
                                    });
                                }}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>
                                <Badge variant='secondary'>任意</Badge>
                                メモ
                            </Form.Label>
                            <textarea
                                className='form-control'
                                value={approvalMemo}
                                onChange={e =>
                                    setState({
                                        ...state,
                                        approvalMemo: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                        <Button
                            variant='light'
                            className='bg-white border'
                            type='submit'
                        >
                            アップロード
                        </Button>
                    </form>
                </Modal.Body>
            </Modal>
        </Container>
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
                <ContractVersionTabs
                    contractable={construction}
                    currentContract={contract}
                    setCurrentContract={c => onChangeContract(c)}
                />
                {contents}
            </section>
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

export default ConstructionApproval;
