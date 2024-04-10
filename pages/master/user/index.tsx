import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Page, UserEditModal, UserCsvModal } from '@/Presentation/Component';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { User } from '@/Domain/Entity';
import { UserRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faPlus,
    faFile,
    faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { EditUser, EditUserForm } from '@/App/Service';
import { useSession } from '@/App/Hook/useSession';

const UserMaster: NextPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [showUserNewModal, setShowUserNewModal] = useState(false);
    const [showUserEditModal, setShowUserEditModal] = useState(false);
    const [showUserCsvModal, setShowUserCsvModal] = useState(false);
    const [onSelectUserForm, setOnSelectUserForm] =
        useState<EditUserForm | null>(null);
    const session = useSession();
    const sessionUser = session ? session.user : null;
    const sessionUserIsAdmin = sessionUser ? sessionUser.admin : null;
    const sessionUserId = sessionUser ? sessionUser.id : null;

    useEffect(() => {
        UserRepository.list().then(setUsers);
    }, []);

    const userRows = users.map((user, index) => (
        <tr key={index}>
            <td title={user.name}>{user.name}</td>
            <td>{user.nameCode}</td>
            <td title={user.department}>{user.department}</td>
            <td title={user.email}>{user.email}</td>
            <td>{user.admin && '○'}</td>
            <td>
                {sessionUserId === user.id || sessionUserIsAdmin ? (
                    <Button
                        onClick={() => {
                            setShowUserEditModal(true);
                            setOnSelectUserForm(EditUser.userToForm(user));
                        }}
                    >
                        <FA icon={faEdit} />
                    </Button>
                ) : (
                    ''
                )}
            </td>
        </tr>
    ));

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>ユーザーマスタ</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            ユーザーマスタ
                        </h3>
                    </div>
                    <div>
                        <Button
                            className='bg-white border'
                            variant='light'
                            onClick={() => UserRepository.downloadCsv()}
                        >
                            <FA icon={faDownload} className='mr-2' />
                            CSV ダウンロード
                        </Button>
                        {sessionUserIsAdmin ? (
                            <>
                                <Button
                                    className='ml-4 bg-white border'
                                    variant='light'
                                    onClick={() =>
                                        setShowUserCsvModal(!showUserCsvModal)
                                    }
                                >
                                    <FA icon={faFile} className='mr-2' />
                                    マスタ一括アップロード
                                </Button>
                                <Button
                                    className='ml-4 bg-white border'
                                    variant='light'
                                    onClick={() => {
                                        setShowUserNewModal(!showUserNewModal);
                                        setOnSelectUserForm(
                                            EditUser.createEmptyForm(),
                                        );
                                    }}
                                >
                                    <FA icon={faPlus} className='mr-2' />
                                    ユーザーを追加
                                </Button>
                            </>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                <Table hover>
                    <thead>
                        <tr>
                            <th style={{ width: '160px' }}>氏名</th>
                            <th style={{ width: '160px' }}>氏名コード</th>
                            <th style={{ width: '160px' }}>部署</th>
                            <th>メールアドレス</th>
                            <th style={{ width: '200px' }}>
                                システム管理者権限
                            </th>
                            <th style={{ width: '64px' }} />
                        </tr>
                    </thead>
                    <tbody>{userRows}</tbody>
                </Table>
            </section>
            {onSelectUserForm && (
                <UserEditModal
                    show={showUserNewModal || showUserEditModal}
                    selectUserForm={onSelectUserForm}
                    isNew={showUserNewModal}
                    isSelf={sessionUserId === onSelectUserForm.id}
                    byAdmin={sessionUserIsAdmin}
                    onHide={() => {
                        setShowUserNewModal(false);
                        setShowUserEditModal(false);
                        setOnSelectUserForm(null);
                    }}
                />
            )}
            <UserCsvModal
                show={showUserCsvModal}
                onHide={() => setShowUserCsvModal(false)}
            />
        </Page>
    );
};

export default UserMaster;
