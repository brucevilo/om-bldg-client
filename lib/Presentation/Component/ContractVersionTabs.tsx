import { Contract, Contractable } from '@/Domain/Entity';
import React, { FC } from 'react';
import styles from '@/Presentation/Style/Components/Tabs.module.scss';

interface Props {
    contractable: Contractable;
    currentContract: Contract;
    setCurrentContract: (contractable: Contract) => void;
}

export const ContractVersionTabs: FC<Props> = ({
    contractable,
    currentContract,
    setCurrentContract,
}) => {
    const tabs = contractable.contracts.map((c, index) => (
        <a
            key={index}
            className={`btn ${currentContract.id === c.id ? 'active' : ''}`}
            onClick={() => setCurrentContract(c)}
        >
            {index === 0 ? '初期設計' : `設計変更${index}`}
        </a>
    ));
    return <nav className={`${styles.tabs} mb-3`}>{tabs}</nav>;
};
