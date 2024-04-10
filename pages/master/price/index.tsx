import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Page, PriceEditModal, PriceCsvModal } from '@/Presentation/Component';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { Price } from '@/Domain/Entity';
import { PriceRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faEdit,
    faPlus,
    faFile,
    faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { EditPrice, EditPriceForm } from '@/App/Service';

const PriceMaster: NextPage = () => {
    const [prices, setPrices] = useState<Price[]>([]);
    const [showPriceNewModal, setShowPriceNewModal] = useState(false);
    const [showPriceCsvModal, setShowPriceCsvModal] = useState(false);
    const [onSelectPriceForm, setOnSelectPriceForm] =
        useState<EditPriceForm | null>(null);

    useEffect(() => {
        PriceRepository.list().then(setPrices);
    }, []);

    const priceRows = prices.map((price, index) => (
        <tr key={index}>
            <td>{price.code}</td>
            <td title={price.name}>{price.name}</td>
            <td title={price.shapeDimension}>{price.shapeDimension}</td>
            <td>{price.price}</td>
            <td>
                <Button
                    onClick={() => {
                        setShowPriceNewModal(true);
                        setOnSelectPriceForm(EditPrice.priceToForm(price));
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
                    <Breadcrumb.Item active>単価表マスタ一覧</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>単価表マスタ</h3>
                    </div>
                    <div>
                        <Button
                            className='bg-white border'
                            variant='light'
                            onClick={() => PriceRepository.downloadCsv()}
                        >
                            <FA icon={faDownload} className='mr-2' />
                            CSV ダウンロード
                        </Button>
                        <Button
                            className='ml-4 bg-white border'
                            variant='light'
                            onClick={() =>
                                setShowPriceCsvModal(!showPriceCsvModal)
                            }
                        >
                            <FA icon={faFile} className='mr-2' />
                            マスタ一括アップロード
                        </Button>
                        <Button
                            className='ml-4 bg-white border'
                            variant='light'
                            onClick={() => {
                                setShowPriceNewModal(!showPriceNewModal);
                                setOnSelectPriceForm(
                                    EditPrice.createEmptyForm(),
                                );
                            }}
                        >
                            <FA icon={faPlus} className='mr-2' />
                            単価表マスタを追加
                        </Button>
                    </div>
                </div>
                <Table hover>
                    <thead>
                        <tr>
                            <th style={{ width: '160px' }}>単価コード</th>
                            <th>名称</th>
                            <th>形状寸法</th>
                            <th>単価</th>
                            <th style={{ width: '64px' }} />
                        </tr>
                    </thead>
                    <tbody>{priceRows}</tbody>
                </Table>
            </section>
            {onSelectPriceForm && (
                <PriceEditModal
                    show={showPriceNewModal}
                    selectPriceForm={onSelectPriceForm}
                    onHide={() => {
                        setShowPriceNewModal(false);
                        setOnSelectPriceForm(null);
                    }}
                />
            )}
            <PriceCsvModal
                show={showPriceCsvModal}
                onHide={() => setShowPriceCsvModal(false)}
            />
        </Page>
    );
};

export default PriceMaster;
