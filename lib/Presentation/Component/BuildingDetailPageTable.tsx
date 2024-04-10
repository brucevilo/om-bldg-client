import React, { FC, useContext } from 'react';
import { Table } from 'react-bootstrap';
import { MasterContext } from '@/Presentation/Context';
import Styles from '@/Presentation/Style/Components/BuildingsDetailPage.module.scss';
import { Contract } from '@/Domain/Entity';
import { DateTime } from 'luxon';

interface Props {
    contracts: Array<Contract>;
}

export const BuildingDetailPageTable: FC<Props> = ({ contracts }) => {
    const { users, suppliers } = useContext(MasterContext);

    const renderType = (contract: Contract) => {
        if (contract.design) {
            return '設計';
        } else if (contract.construction) {
            return '工事';
        }
        return '--';
    };
    const renderFiscalYear = (contractAt: Date | null) => {
        if (contractAt) {
            const date = DateTime.fromJSDate(contractAt);
            return date.month < 4 ? date.year - 1 : date.toFormat('yyyy');
        }
        return '--';
    };
    const renderDocumentNumber = (contract: Contract) => {
        if (contract.design) {
            return contract.design.documentNumber?.value || '';
        } else if (contract.construction) {
            return contract.construction.documentNumber?.value || '';
        }
        return '--';
    };
    const createLink = (contract: Contract) => {
        if (contract.design) {
            return `/designs/${contract.design.id}/summary`;
        } else if (contract.construction) {
            return `/constructions/${contract.construction?.id}/summary`;
        }
        return '#';
    };
    const renderName = (contract: Contract) => {
        if (contract.design) {
            return contract.design.name;
        } else if (contract.construction) {
            return contract.construction.name;
        }
        return '--';
    };
    const renderContractDate = (contractAt: Date | null) => {
        return contractAt
            ? DateTime.fromJSDate(contractAt).toFormat('yyyy/MM/dd')
            : '--';
    };
    const renderCompletionDate = (contract: Contract) => {
        return contract.endAt
            ? DateTime.fromJSDate(contract.endAt).toFormat('yyyy/MM/dd')
            : '--';
    };
    const renderSupplier = (supplierId: number | null) => {
        const supplier = suppliers.find(supplier => supplier.id === supplierId);

        return supplier ? supplier.name : '--';
    };
    const renderDesigner = (designChiefId: number | null) => {
        const designer = users.find(user => user.id === designChiefId);
        return designer ? designer.name : '--';
    };
    const renderManager = (constructionChiefId: number | null) => {
        const manager = users.find(user => user.id === constructionChiefId);
        return manager ? manager.name : '--';
    };

    return (
        <Table responsive className={Styles.bottom_table}>
            <thead>
                <tr>
                    <th className={Styles.kind}>種別</th>
                    <th className={Styles.order_year}>発注年度</th>
                    <th className={Styles.document_number}>工事/設計書番号</th>
                    <th className={Styles.subject}>工事/設計件名</th>
                    <th className={Styles.contract_amount}>請負金額</th>
                    <th className={Styles.budget_type}>予算種別</th>
                    <th className={Styles.contract_date}>着手日/契約日</th>
                    <th className={Styles.completion_date}>完成日/完成期限</th>
                    <th className={Styles.designer_or_constructor}>
                        設計/施工業者
                    </th>
                    <th className={Styles.designers}>設計担当</th>
                    <th className={Styles.manager}>工事担当</th>
                </tr>
            </thead>
            <tbody>
                {contracts.map(contract => {
                    return (
                        <tr key={contract.id}>
                            <td className={Styles.kind}>
                                {renderType(contract)}
                            </td>
                            <td className={Styles.order_year}>
                                {renderFiscalYear(contract.contractAt)}
                            </td>
                            <td className={Styles.document_number}>
                                {renderDocumentNumber(contract)}
                            </td>
                            <td className={Styles.subject}>
                                {contract.design || contract.construction ? (
                                    <a href={createLink(contract)}>
                                        {renderName(contract)}
                                    </a>
                                ) : (
                                    renderName(contract)
                                )}
                            </td>
                            <td className={Styles.contract_amount}>
                                {contract.contractedPrice?.toLocaleString() ||
                                    '--'}
                            </td>
                            <td className={Styles.budget_type}></td>
                            <td className={Styles.contract_date}>
                                {renderContractDate(contract.contractAt)}
                            </td>
                            <td className={Styles.completion_date}>
                                {renderCompletionDate(contract)}
                            </td>
                            <td className={Styles.designer_or_constructor}>
                                {renderSupplier(contract.supplierId)}
                            </td>
                            <td className={Styles.designers}>
                                {renderDesigner(contract.designStaffId)}
                            </td>
                            <td className={Styles.manager}>
                                {renderManager(contract.constructionStaffId)}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};
