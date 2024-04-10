import React, { FC } from 'react';
import { Table } from 'react-bootstrap';
import { SapRecord } from '../apps/SapDocument';
import { SapRecordRow } from './SapRecordRow';

type Props = {
    assets: SapRecord[];
    type?: 'none' | 'checkbox' | 'button';
    selected?: string[];
    errored?: string[];
    onSelect?(item: SapRecord): void;
    onDeselect?(item: SapRecord): void;
};

export const SapRecordTable: FC<Props> = ({
    assets,
    type,
    selected,
    errored,
    onSelect,
    onDeselect,
}) => {
    return (
        <Table>
            <thead>
                <tr>
                    <th hidden={type !== 'checkbox'}></th>
                    <th>KEY</th>
                    <th>資産名称</th>
                    <th>資産テキスト</th>
                    <th>資産クラスコード</th>
                    <th>取得日時</th>
                    <th>取得価額(期末)</th>
                    <th hidden={type !== 'button'}></th>
                </tr>
            </thead>
            <tbody>
                {assets.map(asset => (
                    <SapRecordRow
                        key={asset.assetKey}
                        value={asset}
                        type={type ? type : 'none'}
                        selected={selected && selected.includes(asset.assetKey)}
                        errored={errored && errored.includes(asset.assetKey)}
                        onSelect={() => {
                            onSelect && onSelect(asset);
                        }}
                        onDeselect={() => {
                            onDeselect && onDeselect(asset);
                        }}
                    ></SapRecordRow>
                ))}
            </tbody>
        </Table>
    );
};
