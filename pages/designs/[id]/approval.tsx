import {
    Page,
    DesignDetailTabs,
    ContractVersionTabs,
    DesignActionButton,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, {
    useState,
    useEffect,
    FormEventHandler,
    ChangeEvent,
    useCallback,
    FC,
    ReactNode,
} from 'react';
import { Contract, Design } from '@/Domain/Entity';
import { ContractRepository, DesignRepository } from '@/Domain/Repository';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    Modal,
    Form,
} from 'react-bootstrap';
import { assertsIsExists } from '@/Infrastructure';
import { useRouter } from 'next/router';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import DesignHeaderBreadcrumb from '@/Presentation/Component/DesignHeaderBreadcrumb';

interface Props {
    id: number;
    contractId: number | null;
}
interface State {
    design: Design;
    contract: Contract;
    approvalFile: File | null;
    approvalMemo: string;
    showModal: boolean;
    specFile: File | null;
}

const DesignApproval: NextPage<Props> = ({ id, contractId }) => {
    const [state, setState] = useState<State>();
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);
    const router = useRouter();

    const fetchData = async () => {
        const design = await DesignRepository.get(id);
        const contract = contractId
            ? design.contracts.find(c => c.id === contractId)
            : design.latestContract;
        assertsIsExists(contract);
        setState({
            design,
            contract,
            approvalFile: null,
            approvalMemo: '',
            showModal: false,
            specFile: null,
        });
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    const Layout = useCallback<FC<{ children: ReactNode }>>(
        ({ children }) => {
            if (!state) return null;
            return (
                <Page>
                    <section>
                        <DesignHeaderBreadcrumb
                            design={state.design}
                            displayDeleteButton={() =>
                                setDisplayDeleteButton(!displayDeleteButton)
                            }
                        />
                        <DesignDetailTabs
                            id={id}
                            design={state.design}
                            displayDeleteButton={displayDeleteButton}
                        />
                        {children}
                    </section>
                </Page>
            );
        },
        [state],
    );

    if (!state) return null;

    const {
        design,
        approvalFile,
        approvalMemo,
        showModal,
        contract,
        specFile,
    } = state;

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
    if (design.madeByMigration) {
        return (
            <Layout>
                <ContractVersionTabs
                    contractable={design}
                    currentContract={contract}
                    setCurrentContract={c =>
                        router.push(
                            `/designs/${id}/approval?contract_id=${c.id}`,
                        )
                    }
                />
                <Container fluid>
                    <Row>
                        <Col sm='3' className='font-weight-bold border p-3'>
                            設計稟議書
                        </Col>
                        <Col
                            sm='9'
                            className='border p-3 bg-white d-flex justify-content-between'
                        >
                            {contract.approvalFileInfo && (
                                <a
                                    download
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
            </Layout>
        );
    }

    if (!contract.approvalFileInfo) {
        return (
            <Layout>
                <Card>
                    <Card.Body>
                        <div className='d-flex justify-content-between'>
                            {contract.costDocumentInfo ? (
                                <>
                                    <span>
                                        仕様書・稟議が登録されていません
                                    </span>
                                    <DesignActionButton design={design} />
                                </>
                            ) : (
                                <span>
                                    内訳書が登録されていません。先に前のプロセスを行ってください。
                                </span>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Layout>
        );
    }
    return (
        <Layout>
            <ContractVersionTabs
                contractable={design}
                currentContract={contract}
                setCurrentContract={c =>
                    router.push(`/designs/${id}/approval?contract_id=${c.id}`)
                }
            />
            <Container fluid>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        仕様書
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        {contract.specFileInfo && (
                            <a
                                download
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
                        設計稟議書
                    </Col>
                    <Col
                        sm='9'
                        className='border p-3 bg-white d-flex justify-content-between'
                    >
                        <a
                            download
                            href={
                                process.env.NEXT_PUBLIC_API_ORIGIN +
                                contract.approvalFileInfo.path
                            }
                            style={{ textDecoration: 'none' }}
                        >
                            <FA icon={faFileAlt} className='mr-2' />
                            {contract.approvalFileInfo.filename}
                        </a>
                        <Button
                            variant='light'
                            className='bg-white bordr'
                            onClick={() =>
                                setState({ ...state, showModal: true })
                            }
                            disabled={contract.nextAction !== 'inquiry'}
                        >
                            再アップロード
                        </Button>
                        <Modal
                            show={showModal}
                            onHide={() =>
                                setState({ ...state, showModal: false })
                            }
                        >
                            <Modal.Header>
                                <Modal.Title>
                                    <span className='d-block'>
                                        仕様書・稟議書アップロード
                                    </span>
                                    <small className='text-secondary'>
                                        {design.name}
                                    </small>
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form onSubmit={onSubmit}>
                                    <Form.Group>
                                        <Form.Label>
                                            <Badge
                                                variant='danger'
                                                className='mr-1'
                                            >
                                                必須
                                            </Badge>
                                            仕様書
                                        </Form.Label>
                                        <Form.File
                                            required
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) => {
                                                if (!e.target.files) return;
                                                setState({
                                                    ...state,
                                                    specFile: e.target.files[0],
                                                });
                                            }}
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
                                                    approvalFile:
                                                        e.target.files[0],
                                                });
                                            }}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label>
                                            <Badge variant='info'>任意</Badge>
                                            メモ
                                        </Form.Label>
                                        <textarea
                                            className='form-control'
                                            value={approvalMemo}
                                            onChange={e =>
                                                setState({
                                                    ...state,
                                                    approvalMemo:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </Form.Group>
                                    <Button type='submit'>アップロード</Button>
                                </form>
                            </Modal.Body>
                        </Modal>
                    </Col>
                </Row>
                <Row>
                    <Col sm='3' className='font-weight-bold border p-3'>
                        メモ
                    </Col>
                    <Col sm='9' className='border p-3 bg-white'>
                        <p className='m-0'>{contract.approvalMemo}</p>
                    </Col>
                </Row>
            </Container>
        </Layout>
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

export default DesignApproval;
