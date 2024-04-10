import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import {
    Page,
    PagingButtons,
    SapFixedAssetEditModal,
} from '@/Presentation/Component';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { SapFixedAsset } from '@/Domain/Entity';
import { SapFixedAssetRepository } from '@/Domain/Repository';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileUpload } from '@fortawesome/free-solid-svg-icons';

const SapFixedAssetMaster: NextPage = () => {
    const [sapFixedAssets, setSapFixedAssets] = useState<SapFixedAsset[]>([]);
    const [showSapFixedAssetModal, setShowSapFixedAssetModal] = useState(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    const fetchData = async () => {
        const res = await SapFixedAssetRepository.list(currentPage);
        setSapFixedAssets(res.values);
        if (res.totalPages) setTotalPages(res.totalPages);
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const sapFixedAssetRows = sapFixedAssets.map((sapFixedAsset, index) => (
        <tr key={index}>
            <td>{sapFixedAsset.key}</td>
            <td title={sapFixedAsset.assetName}>{sapFixedAsset.assetName}</td>
            <td title={sapFixedAsset.assetText}>{sapFixedAsset.assetText}</td>
        </tr>
    ));

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>SAP固定資産台帳</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            SAP固定資産台帳
                        </h3>
                    </div>
                    <Button
                        className='bg-white border'
                        variant='light'
                        onClick={() =>
                            setShowSapFixedAssetModal(!showSapFixedAssetModal)
                        }
                    >
                        <FontAwesomeIcon className='mr-2' icon={faFileUpload} />
                        マスタ一括アップロード
                    </Button>
                </div>
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '200px' }}>キー</th>
                                <th style={{ width: '500px' }}>資産名称</th>
                                <th style={{ width: '500px' }}>資産テキスト</th>
                            </tr>
                        </thead>
                        <tbody>{sapFixedAssetRows}</tbody>
                    </Table>
                </div>
                <PagingButtons
                    page={currentPage}
                    totalPages={totalPages}
                    onChangePage={i => setCurrentPage(i)}
                />
            </section>
            {showSapFixedAssetModal && (
                <SapFixedAssetEditModal
                    show={showSapFixedAssetModal}
                    onHide={() => setShowSapFixedAssetModal(false)}
                />
            )}
        </Page>
    );
};

export default SapFixedAssetMaster;
