import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { Page, AssetClassEditModal } from '@/Presentation/Component';
import { Breadcrumb, Button, Table } from 'react-bootstrap';
import { AssetClass } from '@/Domain/Entity';
import { AssetClassRepository } from '@/Domain/Repository';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { EditAssetClass, EditAssetClassForm } from '@/App/Service';

const AssetClassMaster: NextPage = () => {
    const [assetClasses, setAssetClasses] = useState<AssetClass[]>([]);
    const [showAssetClassNewModal, setShowAssetClassNewModal] = useState(false);
    const [onSelectAssetClassForm, setOnSelectAssetClassForm] =
        useState<EditAssetClassForm | null>(null);

    useEffect(() => {
        AssetClassRepository.list().then(setAssetClasses);
    }, []);

    const assetClassRows = assetClasses.map((ac, index) => (
        <tr key={index}>
            <td title={ac.accountItemKou}>{ac.accountItemKou}</td>
            <td title={ac.accountItemMoku}>{ac.accountItemMoku}</td>
            <td title={ac.category}>{ac.category}</td>
            <td>{ac.code}</td>
            <td title={ac.accountDivision}>{ac.accountDivision}</td>
            <td title={ac.name}>{ac.name}</td>
            <td>{ac.usefulLife}</td>
            <td>
                <Button
                    onClick={() => {
                        setShowAssetClassNewModal(true);
                        setOnSelectAssetClassForm(
                            EditAssetClass.assetClassToForm(ac),
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
                    <Breadcrumb.Item active>
                        資産クラスマスタ一覧
                    </Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            資産クラスマスタ
                        </h3>
                    </div>
                    <Button
                        className='bg-white border'
                        variant='light'
                        onClick={() => {
                            setShowAssetClassNewModal(!showAssetClassNewModal);
                            setOnSelectAssetClassForm(
                                EditAssetClass.createEmptyForm(),
                            );
                        }}
                    >
                        <FA icon={faPlus} className='mr-2' />
                        資産クラスマスタを追加
                    </Button>
                </div>
                <div className='table-responsive'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '300px' }}>
                                    勘定科目「項」
                                </th>
                                <th style={{ width: '300px' }}>
                                    勘定科目「目」
                                </th>
                                <th style={{ width: '300px' }}>
                                    資産クラス分類
                                </th>
                                <th style={{ width: '200px' }}>
                                    資産クラスコード
                                </th>
                                <th style={{ width: '300px' }}>資産計上区分</th>
                                <th style={{ width: '700px' }}>
                                    資産クラス名称
                                </th>
                                <th style={{ width: '100px' }}>耐用年数</th>
                                <th style={{ width: '64px' }} />
                            </tr>
                        </thead>
                        <tbody>{assetClassRows}</tbody>
                    </Table>
                </div>
            </section>
            {onSelectAssetClassForm && (
                <AssetClassEditModal
                    show={showAssetClassNewModal}
                    selectAssetClassForm={onSelectAssetClassForm}
                    onHide={() => {
                        setShowAssetClassNewModal(false);
                        setOnSelectAssetClassForm(null);
                    }}
                />
            )}
        </Page>
    );
};

export default AssetClassMaster;
