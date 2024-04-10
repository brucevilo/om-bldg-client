import React, { FC } from 'react';
import { SapFixedAsset } from '@/Domain/Entity';
import { PagingButtons } from '@/Presentation/Component';
import { Table } from 'react-bootstrap';

interface Props {
    sapFixedAssets: SapFixedAsset[];
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

export const SapFixedAssetTabTable: FC<Props> = props => {
    const sapFixedAssetRows = props.sapFixedAssets.map(sapFixedAsset => (
        <tr key={sapFixedAsset.id}>
            {/* 各値は合っているか？ */}
            <td>{sapFixedAsset.key}</td>
            <td title={sapFixedAsset.assetName}>{sapFixedAsset.assetName}</td>
            <td title={sapFixedAsset.assetText}>{sapFixedAsset.assetText}</td>
            <td title={sapFixedAsset.assetClassCode}>
                {sapFixedAsset.assetClassCode}
            </td>
            <td title={sapFixedAsset.recordedAt.toLocaleDateString()}>
                {sapFixedAsset.recordedAt.toLocaleDateString()}
            </td>
            <td title={sapFixedAsset.termEndPrice.toLocaleString()}>
                {sapFixedAsset.termEndPrice.toLocaleString()}円
            </td>
        </tr>
    ));
    return (
        <>
            <div className='table-responsive'>
                <Table hover>
                    <thead>
                        <tr>
                            <th style={{ width: '200px' }}>KEY</th>
                            <th style={{ width: '300px' }}>資産名称</th>
                            <th style={{ width: '300px' }}>資産テキスト</th>
                            <th style={{ width: '200px' }}>資産クラスコード</th>
                            <th style={{ width: '200px' }}>取得日時</th>
                            <th style={{ width: '200px' }}>取得価額(期末)</th>
                        </tr>
                    </thead>
                    <tbody>{sapFixedAssetRows}</tbody>
                </Table>
            </div>
            <PagingButtons
                page={props.currentPage}
                totalPages={props.totalPages}
                onChangePage={i => props.setCurrentPage(i)}
            />
        </>
    );
};
