import React, { useState, useEffect } from 'react';
import {
    Page,
    Tabs,
    WBSTable,
    ProjectBudgetTable,
    SearchModal,
    BusinessRegistrationModal,
} from '@/Presentation/Component';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Breadcrumb, Button } from 'react-bootstrap';
import {
    Construction,
    Design,
    Project,
    ProjectConstruction,
    ProjectDesign,
    ProjectsWithWBS,
} from '@/Domain/Entity';
import {
    ConstructionRepository,
    DesignRepository,
    ProjectConstructionRepository,
    ProjectDesignRepository,
    ProjectRepository,
} from '@/Domain/Repository';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { ProjectByYearWithWBS } from '@/Domain/Entity/ProjectWbsByYear';
import {
    generateWbsExecutionSheet,
    generateProjectWBSSheet,
} from '@/App/Service';
import { ProjectByYearWithWBSAndCS } from '@/Domain/Entity/ProjectWbsByYearAndCS';
import { useContext } from 'react';
import { MasterContext } from '@/Presentation/Context';

export const Projects: NextPage = () => {
    const [projectsWithWBS, setProjectsWithWbs] = useState<ProjectsWithWBS[]>(
        [],
    );
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<
        'WBS' | 'budget_management_department'
    >('WBS');
    const [projects, setProjects] = useState<Project[]>([]);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [projectDesigns, setProjectDesigns] = useState<ProjectDesign[]>([]);
    const [constructions, setConstructions] = useState<Construction[]>([]);
    const [projectConstructions, setProjectConstructions] = useState<
        ProjectConstruction[]
    >([]);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showBusinessRegistrationModal, setShowBusinessRegistrationModal] =
        useState(false);
    const router = useRouter();
    const [projectsByCurrentYear, setProjectsByCurrentYear] = useState<
        ProjectByYearWithWBS[]
    >([]);
    const [projectsByCurrentYearWithWbs, setProjectsByCurrentYearWithWbs] =
        useState<ProjectByYearWithWBSAndCS[]>([]);

    const fetchProjectWithWbs = (
        selectedClassification: string[] = [],
        selectedLargeInvestments: string[] = [],
        selectedProjects: string[] = [],
        selectedWbsLevel2: string[] = [],
        searchWbs = '',
    ) => {
        setIsLoading(true);
        ProjectRepository.getWithWBS(
            selectedClassification.length ? selectedClassification : null,
            selectedLargeInvestments.length ? selectedLargeInvestments : null,
            selectedProjects.length ? selectedProjects : null,
            selectedWbsLevel2.length ? selectedWbsLevel2 : null,
            searchWbs,
        )
            .then(setProjectsWithWbs)
            .finally(() => setIsLoading(false));
    };

    const fetchData = async () => {
        setIsLoading(true);
        const currentYear = new Date().getFullYear().toString();

        const newProjects = await ProjectRepository.index();
        const newDesigns = await DesignRepository.mgetByProjects(newProjects);
        const newProjectDesigns = await ProjectDesignRepository.index();
        const newConstructions = await ConstructionRepository.mgetByProjects(
            newProjects,
        );
        ProjectRepository.listByCurrentYearWithCS(currentYear).then(
            setProjectsByCurrentYearWithWbs,
        );
        const newProjectConstructions =
            await ProjectConstructionRepository.index();
        const newProjectsByCurrentYear =
            await ProjectRepository.listByCurrentYear(currentYear);

        setProjects(newProjects);
        setDesigns(newDesigns);
        setProjectDesigns(newProjectDesigns);
        setConstructions(newConstructions);
        setProjectConstructions(newProjectConstructions);
        setProjectsByCurrentYear(newProjectsByCurrentYear);
        setIsLoading(false);
    };

    const { suppliers } = useContext(MasterContext);

    const onSearch = async (keyword: string) => {
        setShowSearchModal(false);
        router.push(`/projects?keyword=${keyword}`);
    };

    useEffect(() => {
        fetchProjectWithWbs();
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'WBS':
                return (
                    <WBSTable
                        projectsWithWBS={projectsWithWBS}
                        projectDesigns={projectDesigns}
                        designs={designs}
                        projectConstructions={projectConstructions}
                        constructions={constructions}
                        fetchData={fetchProjectWithWbs}
                        isLoading={isLoading}
                    />
                );
            case 'budget_management_department':
                return (
                    <div>
                        <p style={{ color: '#757575' }}>
                            最終更新日：2022年7月31日
                        </p>
                        <ProjectBudgetTable
                            projectsByYear={projectsByCurrentYear}
                            isLoading={isLoading}
                        />
                    </div>
                );
            default:
                return 'pending';
        }
    };

    return (
        <Page>
            <section>
                <Breadcrumb>
                    <Breadcrumb.Item active>事業一覧</Breadcrumb.Item>
                </Breadcrumb>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h3 className='font-weight-bold mr-4'>事業一覧</h3>
                    <div hidden={activeTab !== 'WBS'}>
                        <Button
                            variant='light'
                            className='bg-white border mr-4'
                            onClick={() =>
                                generateProjectWBSSheet(projectsWithWBS)
                            }
                        >
                            <FA icon={faDownload} className='mr-2' />
                            WBSシートダウンロード
                        </Button>
                        <Button
                            as='a'
                            variant='light'
                            className='bg-white border mr-4'
                            onClick={() =>
                                generateWbsExecutionSheet(
                                    projectsByCurrentYearWithWbs,
                                    suppliers,
                                )
                            }
                        >
                            <FA icon={faDownload} className='mr-2' />
                            執行管理票を一括ダウンロード
                        </Button>
                        <Button
                            as='a'
                            variant='light'
                            className='bg-white border'
                            onClick={() =>
                                setShowBusinessRegistrationModal(true)
                            }
                        >
                            +
                        </Button>
                    </div>
                </div>
                <Tabs
                    className='mb-4'
                    items={[
                        {
                            text: 'WBS',
                            href: '',
                            isActive: () => activeTab === 'WBS',
                            onChangeTabs: () => setActiveTab('WBS'),
                        },
                        {
                            text: '予算掌理部署',
                            href: '',
                            isActive: () =>
                                activeTab === 'budget_management_department',
                            onChangeTabs: () =>
                                setActiveTab('budget_management_department'),
                        },
                    ]}
                />
                {renderContent()}
            </section>
            <SearchModal
                show={showSearchModal}
                onHide={() => setShowSearchModal(false)}
                onSearch={onSearch}
            />
            <BusinessRegistrationModal
                projects={projects}
                show={showBusinessRegistrationModal}
                onHide={() => setShowBusinessRegistrationModal(false)}
                fetchProjectWithWbs={() => fetchProjectWithWbs()}
                fetchData={() => fetchData()}
            />
        </Page>
    );
};

export default Projects;
