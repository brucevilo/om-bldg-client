import React, { FC, HTMLProps } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '@/Presentation/Style/Components/Tabs.module.scss';

export interface TabsProps extends HTMLProps<HTMLDivElement> {
    items: {
        text: string;
        href: string;
        as?: string;
        isActive?: (currentUrl: string) => boolean;
        onChangeTabs?: () => void;
    }[];
    isRounded?: boolean;
}

export const Tabs: FC<TabsProps> = ({
    items,
    className,
    isRounded,
    ...props
}) => {
    const router = useRouter();
    const links = items.map((item, index) => {
        const isActive = item.isActive
            ? item.isActive(router.asPath)
            : [item.href, item.as].includes(router.asPath);
        return (
            <Link key={index} href={item.href} as={item.as}>
                <a
                    className={isActive ? 'active' : ''}
                    onClick={() => item.onChangeTabs?.()}
                >
                    {item.text}
                </a>
            </Link>
        );
    });
    return (
        <nav
            className={`${isRounded ? styles.rounded_tabs : styles.tabs} ${
                className || ''
            }`}
            {...props}
        >
            {links}
        </nav>
    );
};
