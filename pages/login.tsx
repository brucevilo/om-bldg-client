import React, { FormEvent, useState } from 'react';
import { SessionService } from '@/App/Service';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import Router from 'next/router';
import { NextPage } from 'next';
import Head from 'next/head';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Login: NextPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [registrationEmail, setRegistrationEmail] = useState('');
    const [showRegisterForm, setShowRegisterForm] = useState(false);
    const onLogin: React.FormEventHandler = async e => {
        e.preventDefault();
        try {
            await SessionService.login(email, password);
            Router.push('/projects');
        } catch {
            alert('失敗しました');
        }
    };

    const onPasswordReset = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await SessionService.onPasswordReset(registrationEmail);
            alert(
                'メールアドレスにリセット用メールが届いておりますので確認お願いします',
            );
        } catch {
            setShowRegisterForm(true);
            alert('失敗しました');
        }
    };
    return (
        <section
            className='bg-primary d-flex align-items-center'
            style={{ minHeight: '100vh' }}
        >
            <Head>
                <title>OM-BLDG</title>
                <meta name='robots' content='noindex,nofollow' />
                <link
                    rel='icon'
                    href='画像URL'
                    sizes='16x16'
                    type='image/png'
                />
            </Head>
            <Container className='mb-5'>
                <Row className='justify-content-center'>
                    <Col lg='6'>
                        <div className='text-center mb-4'>
                            <img src='/logo.png' width='72' />
                        </div>
                        <Card className='p-4'>
                            <Card.Body>
                                <Form onSubmit={onLogin}>
                                    <Form.Group
                                        controlId='formBasicEmail'
                                        className='mb-4'
                                    >
                                        <Form.Label>メールアドレス</Form.Label>
                                        <Form.Control
                                            value={email}
                                            required
                                            type='email'
                                            placeholder='メールアドレス'
                                            onChange={e =>
                                                setEmail(e.target.value)
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group
                                        controlId='formBasicPassword'
                                        className='mb-4'
                                    >
                                        <Form.Label>パスワード</Form.Label>
                                        <Form.Control
                                            required
                                            value={password}
                                            placeholder='パスワード'
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            onChange={e =>
                                                setPassword(e.target.value)
                                            }
                                        />
                                    </Form.Group>
                                    <Form.Group controlId='showPassword'>
                                        <Form.Check
                                            type='checkbox'
                                            label='パスワードを表示する'
                                            checked={showPassword}
                                            onChange={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className='d-flex align-items-center'
                                        />
                                    </Form.Group>
                                    <Button
                                        type='submit'
                                        className='w-100'
                                        variant='primary'
                                    >
                                        ログインする
                                    </Button>
                                </Form>
                                <div className='text-right'>
                                    <span
                                        className='m-0'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            setShowRegisterForm(
                                                !showRegisterForm,
                                            )
                                        }
                                    >
                                        パスワードをお忘れの方はこちら
                                        {showRegisterForm ? (
                                            <FA icon={faChevronUp} />
                                        ) : (
                                            <FA icon={faChevronDown} />
                                        )}
                                    </span>
                                </div>
                                {showRegisterForm && (
                                    <div className='border-top mt-3'>
                                        <Form
                                            onSubmit={onPasswordReset}
                                            className='mt-3'
                                        >
                                            <Form.Group>
                                                <Form.Control
                                                    required
                                                    type='email'
                                                    placeholder='メールアドレス'
                                                    value={registrationEmail}
                                                    onChange={e =>
                                                        setRegistrationEmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </Form.Group>
                                            <div className='d-flex justify-content-between'>
                                                <Button
                                                    variant='light'
                                                    className='font-weight-bold w-100'
                                                    style={{
                                                        fontSize: '14px',
                                                        width: '48%',
                                                    }}
                                                    type='submit'
                                                >
                                                    パスワード変更
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default Login;
