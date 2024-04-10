import React, { FC } from 'react';
import { Button, Table } from 'react-bootstrap';
import { CostItem } from '../apps/entities/CostItem';

type Props = {
    costItems: CostItem[];
    editable: boolean;
    isMerged?: boolean;
    buttonName?: string;
    onSelect?(item: CostItem): void;
    selectedId?: string | null;
};

export const CostItemTable: FC<Props> = ({
    costItems,
    editable,
    isMerged,
    buttonName,
    onSelect,
    selectedId,
}) => {
    return (
        <Table>
            <thead>
                <tr>
                    <th>設計</th>
                    <th>工事種別</th>
                    <th>名称</th>
                    <th>形状寸法</th>
                    <th>単価</th>
                    <th>数量</th>
                    <th>金額</th>
                    <th>摘要</th>
                    <th></th>
                    <th></th>
                    <th>資産区分</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {costItems.map(costItem => (
                    <tr
                        key={costItem.id}
                        className={
                            !costItem.isLinked() ||
                            (isMerged && costItem.amount < 0)
                                ? 'text-danger'
                                : selectedId === costItem.id
                                ? 'text-primary'
                                : ''
                        }
                    >
                        <td>
                            {costItem.designChangeNumber === 0
                                ? '元設計'
                                : `第${costItem.designChangeNumber}回`}
                        </td>
                        <td>{costItem.constructionType}</td>
                        <td>{costItem.name}</td>
                        <td>{costItem.dimension}</td>
                        <td>{costItem.unitPrice}</td>
                        <td>
                            {costItem.amount} {costItem.unit}
                        </td>
                        <td>{costItem.price}</td>
                        <td>{costItem.remarks1}</td>
                        <td>{costItem.remarks2}</td>
                        <td>{costItem.remarks3}</td>
                        <td>{costItem.assetClassDivision}</td>
                        <td>
                            <Button
                                style={{ whiteSpace: 'nowrap' }}
                                hidden={!editable}
                                onClick={() => onSelect && onSelect(costItem)}
                            >
                                {buttonName ? buttonName : '選択'}
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};
