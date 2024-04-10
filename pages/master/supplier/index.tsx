import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
    Page,
    SupplierEditModal,
    SupplierCsvModal,
} from '@/Presentation/Component';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { Supplier } from '@/Domain/Entity';
import { SupplierRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faPlus,
    faFile,
    faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { EditSupplier, EditSupplierForm } from '@/App/Service';

const SupplierMaster: NextPage = () => {
    const [suppliers, setSupplieres] = useState<Supplier[]>([]);
    const [showSupplierNewModal, setShowSupplierNewModal] = useState(false);
    const [showSupplierCsvModal, setShowSupplierCsvModal] = useState(false);
    const [onSelectSupplierForm, setOnSelectSupplierForm] =
        useState<EditSupplierForm | null>(null);

    useEffect(() => {
        SupplierRepository.list().then(setSupplieres);
    }, []);

    const supplierRows = suppliers.map((supplier, index) => (
        <tr key={index}>
            <td title={supplier.name}>{supplier.name}</td>
            <td>{supplier.code}</td>
            <td title={supplier.contact}>{supplier.contact}</td>
            <td>
                <Button
                    onClick={() => {
                        setShowSupplierNewModal(true);
                        setOnSelectSupplierForm(
                            EditSupplier.supplierToForm(supplier),
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
                    <Breadcrumb.Item active>業者マスタ一覧</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>業者マスタ</h3>
                    </div>
                    <div>
                        <Button
                            className='bg-white border'
                            variant='light'
                            onClick={() => SupplierRepository.downloadCsv()}
                        >
                            <FA icon={faDownload} className='mr-2' />
                            CSV ダウンロード
                        </Button>
                        <Button
                            className='ml-4 bg-white border'
                            variant='light'
                            onClick={() =>
                                setShowSupplierCsvModal(!showSupplierCsvModal)
                            }
                        >
                            <FA icon={faFile} className='mr-2' />
                            マスタ一括アップロード
                        </Button>
                        <Button
                            className='ml-4 bg-white border'
                            variant='light'
                            onClick={() => {
                                setShowSupplierNewModal(!showSupplierNewModal);
                                setOnSelectSupplierForm(
                                    EditSupplier.createEmptyForm(),
                                );
                            }}
                        >
                            <FA icon={faPlus} className='mr-2' />
                            業者マスタを追加
                        </Button>
                    </div>
                </div>
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th>業者名</th>
                                <th style={{ width: '150px' }}>
                                    仕入れ先コード
                                </th>
                                <th style={{ width: '150px' }}>業者連絡先</th>
                                <th style={{ width: '64px' }} />
                            </tr>
                        </thead>
                        <tbody>{supplierRows}</tbody>
                    </Table>
                </div>
            </section>
            {onSelectSupplierForm && (
                <SupplierEditModal
                    show={showSupplierNewModal}
                    selectSupplierForm={onSelectSupplierForm}
                    onHide={() => {
                        setShowSupplierNewModal(false);
                        setOnSelectSupplierForm(null);
                    }}
                />
            )}
            <SupplierCsvModal
                show={showSupplierCsvModal}
                onHide={() => {
                    setShowSupplierCsvModal(false);
                }}
            />
        </Page>
    );
};

export default SupplierMaster;
