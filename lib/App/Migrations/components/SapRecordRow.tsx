import React, { FC, useState } from 'react';
import { Button } from 'react-bootstrap';
import { SapRecord } from '../apps/SapDocument';

type Props = {
    value: SapRecord;
    type: 'none' | 'checkbox' | 'button';
    selected?: boolean;
    errored?: boolean;
    onSelect?(): void;
    onDeselect?(): void;
};

export const SapRecordRow: FC<Props> = props => {
    const [selected, setSelected] = useState<boolean>(
        props.selected !== undefined ? props.selected : false,
    );
    return (
        <tr
            className={
                selected ? 'text-primary' : props.errored ? 'text-danger' : ''
            }
        >
            <td hidden={props.type !== 'checkbox'}>
                <input
                    type='checkbox'
                    checked={selected}
                    onChange={e => {
                        setSelected(e.target.checked);
                        if (e.target.checked) {
                            props.onSelect && props.onSelect();
                        } else {
                            props.onDeselect && props.onDeselect();
                        }
                    }}
                ></input>
            </td>
            <td style={{ fontSize: '8px' }}>{props.value.assetKey}</td>
            <td>{props.value.assetName}</td>
            <td style={{ fontSize: '8px' }}>{props.value.assetText}</td>
            <td>{props.value.assetClassCode}</td>
            <td>
                {props.value.acquisitionDate.getFullYear()}/
                {props.value.acquisitionDate.getMonth() + 1}/
                {props.value.acquisitionDate.getDate()}
            </td>
            <td>{props.value.acquisirionPrice}</td>
            <td>
                <Button
                    style={{ whiteSpace: 'nowrap' }}
                    hidden={props.type !== 'button'}
                    onClick={() => props.onSelect && props.onSelect()}
                >
                    選択
                </Button>
            </td>
        </tr>
    );
};
