import React, { FC, HTMLProps, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Container } from 'react-bootstrap';
import styles from '@/Presentation/Style/Components/Page.module.scss';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faCaretSquareLeft,
    faCaretSquareRight,
} from '@fortawesome/free-solid-svg-icons';
import Head from 'next/head';

export const Page: FC<HTMLProps<HTMLDivElement>> = props => {
    const [show, setShow] = useState(true);
    return (
        <Container fluid className={`${styles.wrapper} p-0`}>
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
            {show ? (
                <>
                    <div
                        style={{ left: '220px' }}
                        className={styles.toggle}
                        onClick={() => setShow(false)}
                    >
                        <FA icon={faCaretSquareLeft} />
                    </div>
                    <aside className='bg-primary'>
                        <Sidebar />
                    </aside>
                    <main className='bg-light'>{props.children}</main>
                </>
            ) : (
                <>
                    <div
                        style={{ left: '0' }}
                        className={styles.toggle}
                        onClick={() => setShow(true)}
                    >
                        <FA icon={faCaretSquareRight} />
                    </div>
                    <main style={{ marginLeft: '0' }} className='bg-light'>
                        {props.children}
                    </main>
                </>
            )}
        </Container>
    );
};
