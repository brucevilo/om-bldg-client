import {
    Page,
    StaffSelector,
    SupplierSelector,
} from '@/Presentation/Component';
import { NextPage, GetServerSideProps } from 'next';
import React, {
    useState,
    useEffect,
    FormEventHandler,
    useContext,
} from 'react';
import { ConstructionRepository } from '@/Domain/Repository';
import { Row, Col, Form, Badge, Button, Nav, Navbar } from 'react-bootstrap';
import { useRouter } from 'next/router';
import {
    EditMigratedConstruction,
    EditMigratedConstructionAndContractForm,
} from '@/App/Service/EditMigratedConstruction';
import { MasterContext } from '@/Presentation/Context';
import { MigratedConstructionRepository } from '@/App/Migrations/apps/repositories/ConstructionRepository';
import { Construction } from '@/Domain/Entity';
import { DateTime } from 'luxon';
import Link from 'next/link';

interface Props {
    id: number;
}

const ConstructionApproval: NextPage<Props> = props => {
    const router = useRouter();
    const { users, suppliers } = useContext(MasterContext);
    const [form, setForm] = useState<EditMigratedConstructionAndContractForm>(
        EditMigratedConstruction.createEmptyForm(),
    );
    const [construction, setConstruction] = useState<Construction>();

    const fetchData = async () => {
        const construction = await ConstructionRepository.get(props.id);
        setConstruction(construction);
        const newForm =
            EditMigratedConstruction.contractAndConstructionToForm(
                construction,
            );
        setForm(newForm);
    };

    useEffect(() => {
        fetchData();
    }, [router.query]);

    if (!construction) return <></>;

    const onSubmit: FormEventHandler = async e => {
        e.preventDefault();
        const params = EditMigratedConstruction.formToContractParams(form);
        const res =
            await MigratedConstructionRepository.updateMigratedConstructionAndContract(
                props.id,
                params,
            );
        res && alert('更新しました');
        router.push(`/constructions/${props.id}/summary`);
    };

    return (
        <Page>
            <Navbar bg='white' className='px-5'>
                <Link href={`/migrations/constructions/${props.id}`} passHref>
                    <Nav.Link className='text-dark font-weight-bold mr-3'>
                        ←
                    </Nav.Link>
                </Link>
                <Navbar.Text>
                    <h5 className='text-dark font-weight-bold mb-0'>
                        基本情報編集
                        <small className='ml-3 text-secondary font-weight-normal'>
                            {construction?.name || '工事名未登録'}
                        </small>
                    </h5>
                </Navbar.Text>
            </Navbar>
            <section className='pt-4'>
                <small className='mb-4 d-inline-block'>
                    移行ツールにて、再度「元設計査定表」をアップロードすると基本情報の内容が上書きされてしまうためご注意ください
                </small>
                <Form onSubmit={onSubmit}>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>稟議番号</span>
                        </Form.Label>
                        <Col sm='9'>
                            <input
                                className='form-control'
                                value={form.approvalNumber || ''}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        approvalNumber: e.target.value,
                                    })
                                }
                                placeholder='稟議番号を入力してください。'
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>設計書番号</span>
                        </Form.Label>
                        <Col sm='9'>
                            <input
                                className='form-control'
                                value={form.documentNumber || ''}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        documentNumber: e.target.value,
                                    })
                                }
                                placeholder='設計書番号を入力してください。'
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>
                                設計担当係長
                            </span>
                        </Form.Label>
                        <Col sm='5'>
                            <StaffSelector
                                value={form.designChiefId?.toString() || ''}
                                onChange={id =>
                                    setForm({
                                        ...form,
                                        designChiefId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Label
                                column
                                style={{ backgroundColor: '#E9ECEF' }}
                            >
                                {users.find(
                                    user => user.id === form.designChiefId,
                                )?.name || ''}
                            </Form.Label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>設計担当者</span>
                        </Form.Label>
                        <Col sm='5'>
                            <StaffSelector
                                value={form.designStaffId?.toString() || ''}
                                onChange={id =>
                                    setForm({
                                        ...form,
                                        designStaffId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Label
                                column
                                style={{ backgroundColor: '#E9ECEF' }}
                            >
                                {users.find(
                                    user => user.id === form.designStaffId,
                                )?.name || ''}
                            </Form.Label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>
                                工事担当係長
                            </span>
                        </Form.Label>
                        <Col sm='5'>
                            <StaffSelector
                                value={
                                    form.constructionChiefId?.toString() || ''
                                }
                                onChange={id =>
                                    setForm({
                                        ...form,
                                        constructionChiefId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Label
                                column
                                style={{ backgroundColor: '#E9ECEF' }}
                            >
                                {users.find(
                                    user =>
                                        user.id === form.constructionChiefId,
                                )?.name || ''}
                            </Form.Label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>工事担当者</span>
                        </Form.Label>
                        <Col sm='5'>
                            <StaffSelector
                                value={
                                    form.constructionStaffId?.toString() || ''
                                }
                                onChange={id =>
                                    setForm({
                                        ...form,
                                        constructionStaffId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Label
                                column
                                style={{ backgroundColor: '#E9ECEF' }}
                            >
                                {users.find(
                                    user =>
                                        user.id === form.constructionStaffId,
                                )?.name || ''}
                            </Form.Label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>受注者</span>
                        </Form.Label>
                        <Col sm='5'>
                            <SupplierSelector
                                value={form.supplierId?.toString() || ''}
                                onChange={id =>
                                    setForm({
                                        ...form,
                                        supplierId: id,
                                    })
                                }
                            />
                        </Col>
                        <Col sm='4'>
                            <Form.Label
                                column
                                style={{ backgroundColor: '#E9ECEF' }}
                            >
                                {suppliers.find(
                                    supplier => supplier.id === form.supplierId,
                                )?.name || ''}
                            </Form.Label>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>
                                当初予定価格（税抜）
                            </span>
                        </Form.Label>
                        <Col sm='9'>
                            <input
                                className='form-control'
                                value={form.expectedPrice || ''}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        expectedPrice:
                                            Number(e.target.value) || 0,
                                    })
                                }
                                placeholder='0'
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>
                                当初契約価格（税込）
                            </span>
                        </Form.Label>
                        <Col sm='9'>
                            <input
                                className='form-control'
                                value={form.firstContractedPrice || ''}
                                onChange={e =>
                                    setForm({
                                        ...form,
                                        firstContractedPrice:
                                            Number(e.target.value) || 0,
                                    })
                                }
                                placeholder='0'
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>
                                最終契約価格（税込）
                            </span>
                        </Form.Label>
                        <Col sm='9'>
                            {construction.contracts.length >= 2 ? (
                                <input
                                    className='form-control'
                                    value={
                                        form.lastContractedPrice || undefined
                                    }
                                    onChange={e =>
                                        setForm({
                                            ...form,
                                            lastContractedPrice: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    placeholder='0'
                                />
                            ) : (
                                <input
                                    disabled
                                    className='form-control'
                                    value='契約が1件のみのため入力できません'
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='outline-dark' className='mr-3'>
                                自動
                            </Badge>
                            <span className='font-weight-bold'>落札率</span>
                        </Form.Label>
                        <Col sm='9'>
                            <input
                                className='form-control d-inline-block'
                                value={
                                    `${construction.contracts[0].rate} %` || ''
                                }
                                disabled
                                placeholder='-'
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='outline-dark' className='mr-3'>
                                自動
                            </Badge>
                            <span className='font-weight-bold'>契約日</span>
                        </Form.Label>
                        <Col sm='9'>
                            {form.contractAt ? (
                                <input
                                    type='date'
                                    className='form-control'
                                    disabled
                                    value={DateTime.fromJSDate(
                                        form.contractAt,
                                    ).toFormat('yyyy-MM-dd')}
                                />
                            ) : (
                                <input
                                    type='text'
                                    className='form-control'
                                    disabled
                                    value='未登録（編集は元設計査定表の再アップロード経由で行ってください）'
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Form.Label column sm='3'>
                            <Badge variant='secondary' className='mr-3'>
                                任意
                            </Badge>
                            <span className='font-weight-bold'>工事工期</span>
                        </Form.Label>
                        <Col sm='9'>
                            {form.endAt ? (
                                <input
                                    type='date'
                                    className='form-control'
                                    value={DateTime.fromJSDate(
                                        form.endAt,
                                    ).toFormat('yyyy-MM-dd')}
                                    onChange={e => {
                                        setForm({
                                            ...form,
                                            endAt: new Date(e.target.value),
                                        });
                                    }}
                                />
                            ) : (
                                <input
                                    type='date'
                                    className='form-control'
                                    onChange={e => {
                                        setForm({
                                            ...form,
                                            endAt: new Date(e.target.value),
                                        });
                                    }}
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <div
                        className='mt-5 d-flex'
                        style={{ justifyContent: 'right' }}
                    >
                        <Button variant='secondary'>キャンセル</Button>
                        <Button
                            variant='primary'
                            className='ml-3'
                            type='submit'
                        >
                            保存
                        </Button>
                    </div>
                </Form>
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
