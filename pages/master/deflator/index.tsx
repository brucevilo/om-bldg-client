import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
    Page,
    DeflatorEditModal,
    DeflatorCsvModal,
} from '@/Presentation/Component';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { Deflator } from '@/Domain/Entity';
import { DeflatorRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faPlus,
    faFile,
    faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { EditDeflator, EditDeflatorForm } from '@/App/Service';

const DeflatorMaster: NextPage = () => {
    const [deflators, setDeflators] = useState<Deflator[]>([]);
    const [showDeflatorNewModal, setShowDeflatorNewModal] = useState(false);
    const [showDeflatorEditModal, setShowDeflatorEditModal] = useState(false);
    const [onSelectDeflatorForm, setOnSelectDeflatorForm] =
        useState<EditDeflatorForm | null>(null);
    const [showDeflatorCsvModal, setShowDeflatorCsvModal] = useState(false);

    useEffect(() => {
        DeflatorRepository.list().then(setDeflators);
    }, []);

    const deflatorRows = deflators.map((deflator, index) => (
        <tr key={index}>
            <td>{deflator.year}</td>
            <td title={deflator.rate.toFixed(1)}>{deflator.rate.toFixed(1)}</td>
            <td>
                <Button
                    onClick={() => {
                        setShowDeflatorEditModal(true);
                        setOnSelectDeflatorForm(
                            EditDeflator.deflatorToForm(deflator),
                        );
                    }}
                >
                    <FA icon={faEdit} />
                </Button>
            </td>
        </tr>
    ));

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>デフレート率マスタ</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            デフレート率マスタ
                        </h3>
                    </div>
                    <div>
                        <Button
                            className='bg-white border'
                            variant='light'
                            onClick={() => DeflatorRepository.downloadCsv()}
                        >
                            <FA icon={faDownload} className='mr-2' />
                            CSV ダウンロード
                        </Button>
                        <Button
                            className='ml-4 bg-white border'
                            variant='light'
                            onClick={() =>
                                setShowDeflatorCsvModal(!showDeflatorCsvModal)
                            }
                        >
                            <FA icon={faFile} className='mr-2' />
                            マスタ一括アップロード
                        </Button>
                        <Button
                            className='ml-4 bg-white border'
                            variant='light'
                            onClick={() => {
                                setShowDeflatorNewModal(!showDeflatorNewModal);
                                setOnSelectDeflatorForm(
                                    EditDeflator.createEmptyForm(),
                                );
                            }}
                        >
                            <FA icon={faPlus} className='mr-2' />
                            デフレート率マスタを追加
                        </Button>
                    </div>
                </div>
                <Table hover>
                    <thead>
                        <tr>
                            <th style={{ width: '100px' }}>年度</th>
                            <th>デフレート率</th>
                            <th style={{ width: '64px' }} />
                        </tr>
                    </thead>
                    <tbody>{deflatorRows}</tbody>
                </Table>
            </section>
            {onSelectDeflatorForm && (
                <DeflatorEditModal
                    show={showDeflatorNewModal || showDeflatorEditModal}
                    selectDeflatorForm={onSelectDeflatorForm}
                    isNew={showDeflatorNewModal}
                    onHide={() => {
                        setShowDeflatorNewModal(false);
                        setShowDeflatorEditModal(false);
                        setOnSelectDeflatorForm(null);
                    }}
                />
            )}
            <DeflatorCsvModal
                show={showDeflatorCsvModal}
                onHide={() => setShowDeflatorCsvModal(false)}
            />
        </Page>
    );
};

export default DeflatorMaster;
