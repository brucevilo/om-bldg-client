import React, { FC, useState, useEffect, FormEvent } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { MigrationConstruction } from '../apps/entities/MigrationConstruction';
import { SapRecord, SapRecordMap } from '../apps/SapDocument';
import { SapRecordTable } from './SapRecordTable';

type Props = {
    construction: MigrationConstruction;
    sapRecordMap: SapRecordMap;
    conflicted: boolean;
    onChange(item: MigrationConstruction): void;
    onSelect(): void;
    onDeselect(): void;
    onMerge(): void;
    onSelectAsset(item: SapRecord): void;
    onDeselectAsset(item: SapRecord): void;
    onRegister(): void;
};

export const MigrationConstructionRow: FC<Props> = ({
    construction,
    sapRecordMap,
    conflicted,
    onChange,
    onSelect,
    onDeselect,
    onMerge,
    onSelectAsset,
    onDeselectAsset,
    onRegister,
}) => {
    const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<MigrationConstruction>>({
        year: construction.year,
        name: construction.name,
    });
    const [selected, setSelected] = useState<boolean>(false);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        onChange(
            construction
                .setYear(formData.year ? formData.year : construction.year)
                .setName(formData.name ? formData.name : construction.name),
        );
    };

    useEffect(() => {
        setFormData({
            year: construction.year,
            name: construction.name,
        });
    }, [construction]);
    return (
        <tr>
            <td style={{ width: '90px' }}>
                <input
                    type='checkbox'
                    checked={selected}
                    onChange={e => {
                        setSelected(e.target.checked);
                        if (e.target.checked) {
                            onSelect();
                        } else {
                            onDeselect();
                        }
                    }}
                ></input>
                {selected ? (
                    <Button
                        onClick={() => {
                            setSelected(false);
                            onMerge();
                        }}
                    >
                        結合
                    </Button>
                ) : null}
            </td>
            <td>
                <div className='d-flex justify-content-between'>
                    <Button
                        variant='link'
                        size='lg'
                        onClick={() => setIsDetailVisible(!isDetailVisible)}
                    >
                        <span
                            className={
                                construction.year === 0
                                    ? 'text-danger pr-1'
                                    : 'pr-1'
                            }
                        >
                            {construction.year}年度
                        </span>
                        <span className={conflicted ? 'text-danger' : ''}>
                            {construction.name}
                        </span>
                    </Button>
                    <div className='d-flex align-items-right'>
                        <Button className='mr-3' onClick={() => onRegister()}>
                            工事明細登録
                        </Button>
                    </div>
                </div>
                <div hidden={!isDetailVisible} className='mt-3'>
                    <Form onSubmit={onSubmit} className='mb-3'>
                        <Form.Row>
                            <Col xs='1'>
                                <Form.Control
                                    required
                                    placeholder='年度'
                                    value={formData.year}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            year: Number(e.target.value),
                                        })
                                    }
                                />
                            </Col>
                            <Col xs='10'>
                                <Form.Control
                                    type='text'
                                    required
                                    placeholder='工事名称'
                                    value={formData.name}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                />
                            </Col>
                            <Col xs='1'>
                                <Button type='submit'>変更</Button>
                            </Col>
                        </Form.Row>
                    </Form>
                    <SapRecordTable
                        assets={construction.recordKeys
                            .filter(key => sapRecordMap[key])
                            .map(key => sapRecordMap[key])}
                        type='checkbox'
                        onSelect={onSelectAsset}
                        onDeselect={onDeselectAsset}
                    ></SapRecordTable>
                </div>
            </td>
        </tr>
    );
};
