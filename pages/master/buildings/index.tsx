import React, { useState, useEffect, FormEventHandler } from 'react';
import { Building } from '@/Domain/Entity';
import { DateTime } from 'luxon';
import { Page, PagingButtons } from '@/Presentation/Component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NextPage } from 'next';
import { BuildingRepository } from '@/Domain/Repository';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { Breadcrumb, Table, Form } from 'react-bootstrap';

const Buildings: NextPage = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [buildings, setBuildings] = useState<Array<Building>>([]);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [searchBuilding, setSearchBuilding] = useState<string>('');

    const fetchData = async () => {
        const buildingResponse = await BuildingRepository.getMaster(
            searchBuilding,
            currentPage,
        );
        setTotalPages(buildingResponse.totalPages || 1);
        setBuildings(buildingResponse.values);
    };

    const onSubmit: FormEventHandler = e => {
        e.preventDefault();
        setSearchBuilding(search);
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchBuilding]);

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>建物マスタ一覧</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>
                            建物マスタ一覧
                        </h3>
                    </div>
                    <div>
                        {/* TODO: adding and importing building data for future implementation  */}
                        {/* <Button
                            className='ml-4 btn-light border'
                            style={{ backgroundColor: 'white' }}
                        >
                            <FontAwesomeIcon
                                className='mr-2'
                                icon={faFileUpload}
                            />
                            マスタ一括アップロード
                        </Button>
                        <Button
                            className='ml-4 btn-light border '
                            style={{ backgroundColor: 'white' }}
                        >
                            <FontAwesomeIcon className='mr-2' icon={faPlus} />
                            レコード登録
                        </Button> */}
                    </div>
                </div>
                <form onSubmit={onSubmit}>
                    <Form.Group className='d-flex align-items-center'>
                        <Form.Control
                            className='w-100 form-control building-search'
                            type='text'
                            placeholder='キーワードを入力してください。'
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                            }}
                        />
                        <FontAwesomeIcon
                            className='bg-white position-absolute'
                            style={{
                                right: '65px',
                                color: 'c2c2c2',
                                cursor: 'pointer',
                            }}
                            onClick={onSubmit}
                            icon={faSearch}
                        />
                    </Form.Group>
                </form>
                <div className='table-responsive mt-3'>
                    <Table hover>
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>号線</th>
                                <th style={{ width: '80px' }}>駅番号</th>
                                <th style={{ width: '100px' }}>施設名称</th>
                                <th style={{ width: '170px' }}>所在地</th>
                                <th style={{ width: '120px' }}>建設日</th>
                                <th style={{ width: '170px' }}>構造</th>
                                <th style={{ width: '100px' }}>敷地面積</th>
                                <th style={{ width: '100px' }}>延べ面積</th>
                                <th style={{ width: '100px' }}>建築面積</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buildings.map(building => {
                                return (
                                    <tr key={building.id}>
                                        <td>{building.line}</td>
                                        <td>{building.stationNumber}</td>
                                        <td>{building.facilityName}</td>
                                        <td>{building.location}</td>
                                        <td>
                                            {building.constructionDate
                                                ? DateTime.fromJSDate(
                                                      building.constructionDate,
                                                  ).toFormat('yyyy年MM月dd日')
                                                : ''}
                                        </td>
                                        <td>{building.structure}</td>
                                        <td>{building.landArea}</td>
                                        <td>{building.totalArea}</td>
                                        <td>{building.buildingArea}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <PagingButtons
                    page={currentPage}
                    totalPages={totalPages}
                    onChangePage={i => setCurrentPage(i)}
                />
            </section>
        </Page>
    );
};

export default Buildings;
