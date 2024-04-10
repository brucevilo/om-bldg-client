import React, { FC, useState } from 'react';
import { Nav, Accordion } from 'react-bootstrap';
import NLink from 'next/link';
import Styles from '@/Presentation/Style/Components/Sidebar.module.scss';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

export const Sidebar: FC = () => {
    const [show, setShow] = useState(true);
    return (
        <Nav className={Styles.sidebar}>
            <div>
                <img src='/logo.png' className='mb-2' width='72' />
                <NLink href='/' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        ダッシュボード
                    </Nav.Link>
                </NLink>
                <NLink href='/projects' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        事業一覧
                    </Nav.Link>
                </NLink>
                <NLink href='/designs' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        設計一覧
                    </Nav.Link>
                </NLink>
                <NLink href='/constructions' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        工事一覧
                    </Nav.Link>
                </NLink>
                <NLink href='/assets' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        資産保全台帳
                    </Nav.Link>
                </NLink>
                <NLink href='/change_schedule' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        変更予定
                    </Nav.Link>
                </NLink>
                <NLink href='/buildings' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        建物経歴簿
                    </Nav.Link>
                </NLink>
                <Accordion>
                    {show ? (
                        <Accordion.Toggle
                            as={Nav.Link}
                            className='text-white font-weight-bold d-flex justify-content-between align-items-center'
                            eventKey='0'
                            onClick={() => setShow(false)}
                        >
                            マスタ管理
                            <FA
                                icon={faAngleDown}
                                style={{ width: '30px', height: '30px' }}
                            />
                        </Accordion.Toggle>
                    ) : (
                        <Accordion.Toggle
                            as={Nav.Link}
                            className='text-white font-weight-bold d-flex justify-content-between align-items-center'
                            eventKey='0'
                            onClick={() => setShow(true)}
                        >
                            マスタ管理
                            <FA
                                icon={faAngleUp}
                                style={{ width: '30px', height: '30px' }}
                            />
                        </Accordion.Toggle>
                    )}
                    <Accordion.Collapse eventKey='0'>
                        <div
                            style={{
                                overflow: 'auto',
                                height: '45vh',
                            }}
                        >
                            <NLink href='/master/user' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    ユーザーマスタ
                                </Nav.Link>
                            </NLink>
                            <NLink href='/master/supplier' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    業者マスタ
                                </Nav.Link>
                            </NLink>
                            <NLink href='/master/sap_fixed_asset' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    SAP固定資産台帳マスタ
                                </Nav.Link>
                            </NLink>
                            <NLink href='/master/deflator' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    デフレート率マスタ
                                </Nav.Link>
                            </NLink>
                            <NLink href='/master/price' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    単価表マスタ
                                </Nav.Link>
                            </NLink>
                            <NLink href='/master/asset_class' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    資産クラスマスタ
                                </Nav.Link>
                            </NLink>
                            <NLink href='/master/buildings' passHref>
                                <Nav.Link className='text-white font-weight-bold ml-3'>
                                    建物マスタ
                                </Nav.Link>
                            </NLink>
                        </div>
                    </Accordion.Collapse>
                </Accordion>
            </div>
            <div>
                <NLink href='/migrations' passHref>
                    <Nav.Link className='text-white font-weight-bold'>
                        移行ツール(仮)
                    </Nav.Link>
                </NLink>
            </div>
        </Nav>
    );
};
