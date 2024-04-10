import React, { useState, useEffect, FormEventHandler } from 'react';
import { NextPage, GetServerSideProps } from 'next';
import { Page, Tabs } from '@/Presentation/Component';
import { Project, Design, Construction } from '@/Domain/Entity';
import {
    ProjectRepository,
    DesignRepository,
    ConstructionRepository,
} from '@/Domain/Repository';
import { Button, Breadcrumb, Table } from 'react-bootstrap';
import Link from 'next/link';
import router from 'next/router';
import { DeleteDataModal } from '@/Presentation/Component/DeleteDataModal';

interface Props {
    id: number;
}

interface State {
    project: Project;
    designs: Design[];
    constructions: Construction[];
}

const useData = (props: Props): State | null => {
    const [state, setState] = useState<State | null>(null);

    const fetchData = async () => {
        const project = await ProjectRepository.get(props.id);
        const designs = await DesignRepository.listByProject(project);
        const constructions = await ConstructionRepository.listByProject(
            project,
        );
        setState({
            project,
            designs,
            constructions,
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    return state;
};

const ProjectWBS: NextPage<Props> = props => {
    const data = useData(props);
    const [showDeleteDataModal, setShowDeleteDataModal] =
        useState<boolean>(false);
    const [displayDeleteButton, setDisplayDeleteButton] =
        useState<boolean>(false);

    if (!data) return null;

    const { project, designs, constructions } = data;

    const deleteProject: FormEventHandler = async e => {
        e.preventDefault();
        await ProjectRepository.delete(project);
        router.push('/projects');
    };
    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Link href='/projects' passHref>
                        <Breadcrumb.Item>事業一覧</Breadcrumb.Item>
                    </Link>
                    <Breadcrumb.Item active>{project.name}</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h3 className='font-weight-bold mr-4'>{project.name}</h3>
                    <div>
                        <Button
                            className='bg-white border px-2 py-0'
                            style={{ color: 'gray', fontSize: '20px' }}
                            onClick={() =>
                                setDisplayDeleteButton(!displayDeleteButton)
                            }
                        >
                            …
                        </Button>
                    </div>
                </div>
                <div className='d-flex justify-content-between'>
                    <Tabs
                        className='my-4'
                        items={[
                            {
                                href: '/projects/[id]',
                                as: `/projects/${props.id}`,
                                text: '基本情報',
                            },
                            {
                                href: '/projects/[id]/wbs',
                                as: `/projects/${props.id}/wbs`,
                                text: 'WBS',
                            },
                            {
                                href: '/projects/[id]/relations',
                                as: `/projects/${props.id}/relations`,
                                text: '関連図',
                            },
                        ]}
                    />
                    {displayDeleteButton && (
                        <div style={{ position: 'relative', bottom: '20px' }}>
                            <Button
                                variant='light'
                                className='bg-white border py-2'
                                style={{
                                    color: 'red',
                                    paddingRight: '70px',
                                }}
                                onClick={() => setShowDeleteDataModal(true)}
                            >
                                削除する
                            </Button>
                        </div>
                    )}
                </div>
                <div className='table-responsive mt-3'>
                    <Table style={{ fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '160px',
                                    }}
                                >
                                    WBSコード
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '190px',
                                    }}
                                >
                                    財務分類
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '140px',
                                    }}
                                >
                                    予算掌理部(課)
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '270px',
                                    }}
                                >
                                    予算掌理区分(第2階層コード)
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '310px',
                                    }}
                                >
                                    工事名称等
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '150px',
                                    }}
                                >
                                    工事稟議番号
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '250px',
                                    }}
                                >
                                    施工課
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '90px',
                                    }}
                                >
                                    予算科目
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '635px',
                                    }}
                                >
                                    事業コード
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '125px',
                                    }}
                                >
                                    資産クラス
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '180px',
                                    }}
                                >
                                    過年度累計1年目以前
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目4月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目5月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目6月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目7月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目8月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目9月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目10月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目11月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目12月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目1月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目2月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目3月
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    2年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    3年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    4年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    5年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    6年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    7年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    8年目合計
                                </th>
                                <th
                                    style={{
                                        backgroundColor: '#EDEDED',
                                        width: '115px',
                                    }}
                                >
                                    PJ期間合計
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                            <tr>
                                <td>BB170551-B1ZK1</td>
                                <td>資産【自己調達資金】</td>
                                <td>車.車両企画課</td>
                                <td>施設改善_安全関連(老朽設備取替)</td>
                                <td>検査棟シャッター更新(中百舌鳥検車場)</td>
                                <td>建．建築企画課</td>
                                <td>工事原価勘定-鉄道事業-外注費</td>
                                <td>101H1</td>
                                <td>
                                    鉄有固-運送施設
                                    建物付属設備-エヤーカーテン又はドアー自動開閉設備-車庫・
                                    工場
                                </td>
                                <td>69,265,000円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                                <td>3,180,600円</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </section>
            <DeleteDataModal
                onDelete={deleteProject}
                ableDelete={designs.length === 0 && constructions.length === 0}
                data={project}
                show={showDeleteDataModal}
                onHide={() => setShowDeleteDataModal(false)}
            />
        </Page>
    );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
    params,
}) => {
    return {
        props: {
            id: Number(params?.id),
        },
    };
};

export default ProjectWBS;
