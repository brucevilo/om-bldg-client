import { PasswordResetParams, SessionService } from '@/App/Service';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

const PasswordReset: NextPage<{ token: string }> = (props: {
    token: string;
}) => {
    const router = useRouter();
    const [passwordResetParams, setPasswordResetParams] =
        useState<PasswordResetParams>({
            password: '',
            password_confirmation: '',
        });
    const onPasswordResetComplete = async (
        e: React.FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        try {
            await SessionService.passwordResetComplete(
                passwordResetParams,
                props.token,
            );
            router.push('/projects');
        } catch {
            alert(
                'リンクの期限が切れているか、今と同じパスワードを使用している可能性があります',
            );
        }
    };
    return (
        <div className='d-flex flex-column'>
            <div
                className='text-center px-4 bg-white'
                style={{ padding: '35px 0' }}
            >
                <h1 className='mb-4 h4'>パスワード再設定</h1>
                <Form onSubmit={onPasswordResetComplete}>
                    <Form.Group className='mb-4 text-left'>
                        <Form.Control
                            type='password'
                            placeholder='新しいパスワード'
                            required
                            onChange={e => {
                                setPasswordResetParams({
                                    ...passwordResetParams,
                                    password: e.target.value,
                                });
                            }}
                        />
                        <Form.Label
                            className='text-muted text-left ml-0 pt-2'
                            style={{ fontSize: '8px', lineHeight: '16px' }}
                        ></Form.Label>
                    </Form.Group>
                    <Form.Group className='mb-4'>
                        <Form.Control
                            type='password'
                            placeholder='新しいパスワード(確認)'
                            required
                            onChange={e => {
                                if (
                                    passwordResetParams.password ===
                                    e.target.value
                                ) {
                                    e.target.setCustomValidity('');
                                } else {
                                    e.target.setCustomValidity(
                                        '2つのパスワードが一致しません',
                                    );
                                }
                                setPasswordResetParams({
                                    ...passwordResetParams,
                                    password_confirmation: e.target.value,
                                });
                            }}
                        />
                    </Form.Group>
                    <Button
                        type='submit'
                        variant='secondary'
                        className='text-white w-100 mb-3'
                    >
                        パスワードを再設定する
                    </Button>
                </Form>
            </div>
        </div>
    );
};

PasswordReset.getInitialProps = async ctx => {
    return {
        token: ctx.query['token'] as string,
    };
};

export default PasswordReset;
