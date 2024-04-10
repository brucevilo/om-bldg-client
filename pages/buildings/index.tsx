import React, { useEffect, useState, FormEventHandler } from 'react';
import { Building } from '@/Domain/Entity';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { Page, PagingButtons } from '@/Presentation/Component';
import { NextPage } from 'next';
import { Breadcrumb, Button, Form, InputGroup, Table } from 'react-bootstrap';
import Styles from '@/Presentation/Style/Components/BuildingsPage.module.scss';
import { BuildingRepository } from '@/Domain/Repository';

const Buildings: NextPage = () => {
    const [buildings, setBuildings] = useState<Array<Building>>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchDebounce, setSearchDebounce] = useState<string>('');
    const [totalPages, setTotalPages] = useState<number>(1);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lines, setLines] = useState<string[]>(['すべての号線']);
    const [selectedLine, setSelectedLine] = useState<string>('すべての号線');
    const [buildingTypes, setBuildingTypes] = useState<string[]>([
        'すべての建物',
    ]);
    const [selectedBuildingType, setSelectedBuildingType] =
        useState<string>('すべての建物');

    const fetchDropdownData = async () => {
        const linesList = await BuildingRepository.getBuildingLines();
        const buildingTypesList = await BuildingRepository.getBuildingTypes();

        setLines(['すべての号線', ...linesList]);
        setBuildingTypes(['すべての建物', ...buildingTypesList]);
    };

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchData = async (page: number) => {
        const selectedLineParam =
            selectedLine === 'すべての号線' ? null : selectedLine;
        const selectedBuildingTypeParam =
            selectedBuildingType === 'すべての建物'
                ? null
                : selectedBuildingType;

        const buildingResponse = await BuildingRepository.get(
            page || currentPage,
            searchQuery,
            selectedLineParam,
            selectedBuildingTypeParam,
        );
        setCurrentPage(page);

        setTotalPages(buildingResponse.totalPages || 1);
        setBuildings(buildingResponse.values);
    };

    useEffect(() => {
        fetchData(1);
    }, [searchQuery, selectedLine, selectedBuildingType]);

    const handleOnSubmitSearch: FormEventHandler = e => {
        e.preventDefault();
        setSearchQuery(searchDebounce);
    };

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>建物経歴簿</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-center'>
                        <h3 className='font-weight-bold mr-4'>建物経歴簿</h3>
                    </div>
                </div>
                <div className='d-flex flex-wrap'>
                    <Form onSubmit={handleOnSubmitSearch}>
                        <Form.Group className='p-2'>
                            <InputGroup
                                className={`mb-3 ${Styles.search_bar_group}`}
                            >
                                <Form.Control
                                    placeholder='キーワードで検索'
                                    value={searchDebounce}
                                    onChange={e =>
                                        setSearchDebounce(e.target.value)
                                    }
                                    className={Styles.search_bar}
                                />
                                <Button
                                    id='text-addon1'
                                    className={Styles.search_icon}
                                    onClick={handleOnSubmitSearch}
                                >
                                    <FA icon={faSearch} className='text-dark' />
                                </Button>
                            </InputGroup>
                        </Form.Group>
                    </Form>
                    <Form.Group className='p-2'>
                        <Form.Control
                            as='select'
                            onChange={e => setSelectedLine(e.target.value)}
                            className={Styles.dropdown_filter}
                            value={selectedLine}
                        >
                            {lines.map(line => (
                                <option key={line}>{line}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group className='p-2'>
                        <Form.Control
                            as='select'
                            onChange={e =>
                                setSelectedBuildingType(e.target.value)
                            }
                            className={Styles.dropdown_filter}
                            value={selectedBuildingType}
                        >
                            {buildingTypes.map(type => (
                                <option key={type}>{type}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </div>
                <div className='overflow-auto'>
                    <Table>
                        <thead>
                            <tr>
                                <th className={Styles.line}>号線</th>
                                <th className={Styles.type}>建物種別</th>
                                <th className={Styles.facility}>施設名称</th>
                                <th className={Styles.location}>所在地</th>
                            </tr>
                        </thead>
                        <tbody>
                            {buildings.map(building => {
                                return (
                                    <tr key={building.id}>
                                        <td className={Styles.line}>
                                            {building.line}
                                        </td>
                                        <td className={Styles.type}>
                                            {building.buildingType}
                                        </td>
                                        <td className={Styles.facility}>
                                            <a
                                                href={`/buildings/${building.id}`}
                                            >
                                                {building.facilityName}
                                            </a>
                                        </td>
                                        <td className={Styles.location}>
                                            {building.location}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>
                <PagingButtons
                    page={currentPage}
                    totalPages={totalPages}
                    onChangePage={i => fetchData(i)}
                />
            </section>
        </Page>
    );
};

export default Buildings;
