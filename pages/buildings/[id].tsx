import React, { useEffect, useState } from 'react';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { Page } from '@/Presentation/Component';
import { GetServerSideProps, NextPage } from 'next';
import { Form, Table } from 'react-bootstrap';
import { Breadcrumb, BuildingDetailPageTable } from '@/Presentation/Component';
import Styles from '@/Presentation/Style/Components/BuildingsDetailPage.module.scss';
import { BuildingRepository } from '@/Domain/Repository';
import { Building, Contract } from '@/Domain/Entity';
import { DateTime } from 'luxon';

type types = 'construction' | 'design';

interface Props {
    buildingId: number;
}

const BuildingDetails: NextPage<Props> = ({ buildingId }) => {
    const [selectedTypes, setSelectedTypes] = useState<types[]>([
        'construction',
        'design',
    ]);
    const [buildingDetails, setBuildingDetails] = useState<Building>();
    const [relatedContracts, setRelatedContracts] = useState<Contract[]>([]);

    const fetchBuildingDetails = async () => {
        const details = await BuildingRepository.getBuildingDetails(buildingId);

        setBuildingDetails(details);
    };

    const fetchRelatedContracts = async () => {
        const relatedContractsResponse =
            await BuildingRepository.getRelatedContracts(
                buildingId,
                selectedTypes,
            );

        setRelatedContracts(relatedContractsResponse);
    };

    useEffect(() => {
        fetchBuildingDetails();
    }, [buildingId]);

    useEffect(() => {
        fetchRelatedContracts();
    }, [buildingId, selectedTypes]);

    const drawingUrl =
        `${process.env.NEXT_PUBLIC_API_ORIGIN}${buildingDetails?.drawingInfo?.path}` ||
        '';
    const drawingFileName = buildingDetails?.drawingInfo?.filename || '';

    const onCheckboxTick = (type: types) => {
        const tempSelectedTypes = [...selectedTypes];
        const index = tempSelectedTypes.indexOf(type);

        if (index !== -1) tempSelectedTypes.splice(index, 1);
        else tempSelectedTypes.push(type);

        setSelectedTypes(tempSelectedTypes);
    };

    return (
        <Page>
            <section>
                <Breadcrumb
                    items={[
                        { text: '建物経歴簿', href: '/buildings' },
                        { text: '住之江公園駅', href: '/', active: true },
                    ]}
                />
                <div className='d-flex align-items-center'>
                    <h3 className='font-weight-bold mr-4'>
                        {buildingDetails?.facilityName}
                    </h3>
                    <h6 className={`ml-2 ${Styles.sub_title}`}>
                        {buildingDetails?.location}
                    </h6>
                </div>
                <h5 className='mt-4 font-weight-bold'>基本情報</h5>
                <Table bordered>
                    <tbody>
                        <tr className='d-flex flex-direction-row'>
                            <td className='d-flex flex-direction-row w-100'>
                                <div
                                    className='font-weight-bold'
                                    style={{ width: '17%' }}
                                >
                                    図面
                                </div>
                                <a
                                    href={drawingUrl}
                                    target='_blank'
                                    style={{ textDecoration: 'none' }}
                                    rel='noreferrer'
                                >
                                    <FA icon={faFile} className='fa-light' />{' '}
                                    {drawingFileName}
                                </a>
                            </td>
                            <td className='d-flex flex-direction-row w-100'>
                                <div
                                    className='font-weight-bold'
                                    style={{ width: '17%' }}
                                >
                                    敷地面積
                                </div>
                                <div>
                                    {buildingDetails?.landArea
                                        ? `${buildingDetails?.landArea}㎡`
                                        : '--'}
                                </div>
                            </td>
                        </tr>
                        <tr className='d-flex flex-direction-row'>
                            <td className='d-flex flex-direction-row w-100'>
                                <div
                                    className='font-weight-bold'
                                    style={{ width: '17%' }}
                                >
                                    建設日
                                </div>

                                <div>
                                    {buildingDetails?.constructionDate
                                        ? DateTime.fromJSDate(
                                              buildingDetails.constructionDate,
                                          ).toFormat('yyyy年MM月dd日')
                                        : '--'}
                                </div>
                            </td>
                            <td className='d-flex flex-direction-row w-100'>
                                <div
                                    className='font-weight-bold'
                                    style={{ width: '17%' }}
                                >
                                    延べ面積
                                </div>
                                <div>
                                    {buildingDetails?.totalArea
                                        ? `${buildingDetails?.totalArea}㎡`
                                        : '--'}
                                </div>
                            </td>
                        </tr>
                        <tr className='d-flex flex-direction-row'>
                            <td className='d-flex flex-direction-row w-100'>
                                <div
                                    className='font-weight-bold'
                                    style={{ width: '17%' }}
                                >
                                    構造
                                </div>
                                <div>
                                    {buildingDetails?.structure
                                        ? buildingDetails?.structure
                                        : '--'}
                                </div>
                            </td>
                            <td className='d-flex flex-direction-row w-100'>
                                <div
                                    className='font-weight-bold'
                                    style={{ width: '17%' }}
                                >
                                    建築面積
                                </div>
                                <div>
                                    {buildingDetails?.buildingArea
                                        ? `${buildingDetails?.buildingArea}㎡`
                                        : '--'}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </Table>

                <Form.Group className='d-flex flex-row'>
                    <Form.Label className={Styles.checkbox_label}>
                        絞り込み:
                    </Form.Label>
                    <Form.Check
                        type='checkbox'
                        label='工事'
                        inline
                        checked={selectedTypes.includes('construction')}
                        value='construction'
                        onChange={e => onCheckboxTick(e.target.value as types)}
                    />
                    <Form.Check
                        type='checkbox'
                        label='設計'
                        inline
                        checked={selectedTypes.includes('design')}
                        value='design'
                        onChange={e => onCheckboxTick(e.target.value as types)}
                    />
                </Form.Group>

                <BuildingDetailPageTable contracts={relatedContracts} />
            </section>
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    query,
}) => {
    return {
        props: {
            buildingId: Number(query.id),
        },
    };
};

export default BuildingDetails;
