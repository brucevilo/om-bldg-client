import Link from 'next/link';
import React, { FC } from 'react';
import { Breadcrumb as BC, BreadcrumbProps as BCProps } from 'react-bootstrap';

export type BreadcrumbProps = BCProps & {
    items: {
        text: string;
        href: string;
        as?: string;
        active?: boolean;
    }[];
};

export const Breadcrumb: FC<BreadcrumbProps> = ({ items, ...bcProps }) => {
    const itemList = items.map(({ href, as, text, active }) =>
        active ? (
            <BC.Item key={href} active>
                {text}
            </BC.Item>
        ) : (
            <Link key={href} href={href} as={as} passHref>
                <BC.Item>{text}</BC.Item>
            </Link>
        ),
    );
    return <BC {...bcProps}>{itemList}</BC>;
};
