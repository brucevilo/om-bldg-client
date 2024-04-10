import React, {
    FC,
    FormEventHandler,
    useState,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import { Badge, Button, Form, Spinner, Table } from 'react-bootstrap';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faFilter,
    faMinusSquare,
    faPlusSquare,
    faSearch,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { generateFiscalYear } from '@/App/Migrations/apps/utils';
import styles from '@/Presentation/Style/Components/WBSTable.module.scss';
import { sum, uniq } from 'lodash';
import {
    Construction,
    Design,
    ProjectConstruction,
    ProjectDesign,
    ProjectsWithWBS,
} from '@/Domain/Entity';
import { assertsIsExists } from '@/Infrastructure';
import { useClickedOutside } from '@/App/Hook/useClickedOutside';
import { useDebounce } from '@/App/Hook/useDebounce';

const monthsAndYears = [
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
    'january',
    'february',
    'march',
    'april',
    'annualTotal',
    'firstYear',
    'secondYear',
    'thirdYear',
    'fourthYear',
    'midtermTotal',
] as const;

type MonthsAndYears = typeof monthsAndYears[number];
interface Props {
    projectsWithWBS: ProjectsWithWBS[];
    projectDesigns: ProjectDesign[];
    designs: Design[];
    projectConstructions: ProjectConstruction[];
    constructions: Construction[];
    isLoading: boolean;
    fetchData: (
        selectedClassifications: string[],
        selectedLargeInvestments: string[],
        selectedProjects: string[],
        selectedWbsLevel2: string[],
        searchWbs: string,
    ) => void;
}

export const WBSTable: FC<Props> = ({
    projectsWithWBS,
    projectDesigns,
    designs,
    projectConstructions,
    constructions,
    isLoading,
    fetchData,
}) => {
    const filterRef = useRef<HTMLDivElement | null>(null);
    const filterIconRef = useRef<HTMLDivElement | null>(null);
    const [isBreakdownShown, setIsBreakdownShown] = useState<boolean>(false);
    const fiscalYearMonths = generateFiscalYear(2023);
    const [isWbsLevel2Shown, setIsWbsLevel2Shown] = useState<boolean>(false);
    const [selectedWbsLevel2Codes, setSelectedWbsLevel2Codes] = useState<
        string[]
    >([]);
    const [isClassificationShown, setIsClassificationShown] =
        useState<boolean>(false);
    const [selectedClassifications, setSelectedClassifications] = useState<
        string[]
    >([]);
    const [isProjectShown, setIsProjectShown] = useState<boolean>(false);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [isSearchShown, setIsSearchShown] = useState<boolean>(false);
    const [isLargeInvestmentShown, setIsLargeInvestmentShown] =
        useState<boolean>(false);
    const [selectedLargeInvestments, setSelectedLargeInvestments] = useState<
        string[]
    >([]);
    const [searchFilter, setSearchFilter] = useState<string>('');
    const [filtersChanged, setFiltersChanged] = useState<boolean>(false);

    const populateCheckbox = () => {
        const tempClassificationsFilters = projectsWithWBS.map(wbs => {
            return wbs.financialClassification;
        });
        tempClassificationsFilters.push(...selectedClassifications);
        const selectableClassifications = uniq(tempClassificationsFilters);

        const tempWbsLevel2Filters = projectsWithWBS.map(wbs => {
            return wbs.wbsLevel2 as string;
        });
        tempWbsLevel2Filters.push(...selectedWbsLevel2Codes);
        const selectableWbsLevel2 = uniq(tempWbsLevel2Filters);

        const tempProjectNameFilters = projectsWithWBS.map(wbs => {
            return wbs.name;
        });
        tempProjectNameFilters.push(...selectedProjects);
        const selectableProjectNames = uniq(tempProjectNameFilters);

        const tempLargeInvestmentsFilters = projectsWithWBS.map(wbs => {
            return wbs.largeInvestment;
        });
        tempLargeInvestmentsFilters.push(...selectedLargeInvestments);
        const selectableLargeInvestments = uniq(tempLargeInvestmentsFilters);

        return {
            selectableClassifications,
            selectableLargeInvestments,
            selectableProjectNames,
            selectableWbsLevel2,
        };
    };

    const selectables = useMemo(() => {
        return populateCheckbox();
    }, [projectsWithWBS]);

    const onSubmitSearchFilter: FormEventHandler = e => {
        e.preventDefault();
        fetchData(
            selectedClassifications,
            selectedLargeInvestments,
            selectedProjects,
            selectedWbsLevel2Codes,
            searchFilter,
        );
    };

    const addOrRemoveWordFromArray = (
        array: string[],
        word: string,
    ): string[] => {
        const index = array.findIndex(text => text === word);

        if (index === -1) {
            array.push(word);
        } else {
            array.splice(index, 1);
        }

        return array;
    };

    const handleFilterCheckboxOnChange = (
        filterCheckboxGroup: string,
        checkboxValue: string,
    ) => {
        switch (filterCheckboxGroup) {
            case 'largeInvestmentFilters':
                setSelectedLargeInvestments(
                    addOrRemoveWordFromArray(
                        [...selectedLargeInvestments],
                        checkboxValue,
                    ),
                );
                break;
            case 'classificationFilters':
                setSelectedClassifications(
                    addOrRemoveWordFromArray(
                        [...selectedClassifications],
                        checkboxValue,
                    ),
                );
                break;
            case 'wbsLevel2Filters':
                setSelectedWbsLevel2Codes(
                    addOrRemoveWordFromArray(
                        [...selectedWbsLevel2Codes],
                        checkboxValue,
                    ),
                );
                break;
            case 'projectFilters':
                setSelectedProjects(
                    addOrRemoveWordFromArray(
                        [...selectedProjects],
                        checkboxValue,
                    ),
                );
                break;
            default:
                break;
        }
        setFiltersChanged(true);
    };

    const toggleFilters = (filterName: string) => {
        let tempClassification = false;
        let tempLargeInvestment = false;
        let tempWbs = false;
        let tempProject = false;
        let tempSearch = false;

        switch (filterName) {
            case 'classificationFilters':
                tempClassification = !isClassificationShown;
                break;
            case 'largeInvestmentFilters':
                tempLargeInvestment = !isLargeInvestmentShown;
                break;
            case 'wbsLevel2Filters':
                tempWbs = !isWbsLevel2Shown;
                break;
            case 'projectFilters':
                tempProject = !isProjectShown;
                break;
            case 'searchFilter':
                tempSearch = !isSearchShown;
                break;
            default:
                break;
        }

        setIsClassificationShown(tempClassification);
        setIsWbsLevel2Shown(tempWbs);
        setIsProjectShown(tempProject);
        setIsLargeInvestmentShown(tempLargeInvestment);
        setIsSearchShown(tempSearch);
    };
    const debouncedValue = useDebounce(filtersChanged, 1000);
    useEffect(() => {
        if (debouncedValue && filtersChanged) {
            fetchData(
                selectedClassifications,
                selectedLargeInvestments,
                selectedProjects,
                selectedWbsLevel2Codes,
                searchFilter,
            );
            setFiltersChanged(false);
            setIsWbsLevel2Shown(false);
            setIsClassificationShown(false);
            setIsProjectShown(false);
            setIsLargeInvestmentShown(false);
        }
    }, [debouncedValue]);

    // close filter container when clicked outside of the container or the filter icon
    const { isClickedOutside, node } = useClickedOutside();
    useEffect(() => {
        if (
            isClickedOutside &&
            node &&
            filterIconRef?.current &&
            !filterIconRef?.current.contains(node) &&
            filterRef?.current &&
            !filterRef?.current.contains(node)
        ) {
            setIsClassificationShown(false);
            setIsWbsLevel2Shown(false);
            setIsProjectShown(false);
            setIsLargeInvestmentShown(false);
            setIsSearchShown(false);
        }
    }, [isClickedOutside, node]);

    const projectRows = projectsWithWBS.map((project, index) => {
        const designIds = projectDesigns
            .filter(pd => pd.projectId === project.id)
            .map(pd => pd.designId);
        const filteredDesigns = designs.filter(d => {
            if (!d.id) return assertsIsExists(d);
            return designIds.includes(d.id);
        });
        const designFees = sum(
            filteredDesigns.map(d => d.latestContract.contractedPrice),
        );
        const constructionIds = projectConstructions
            .filter(pc => pc.projectId === project.id)
            .map(pc => pc.constructionId);
        const filteredConstructions = constructions.filter(c => {
            if (!c.id) return assertsIsExists(c);
            return constructionIds.includes(c.id);
        });
        const constructionFees = sum(
            filteredConstructions.map(c => c.latestContract.contractedPrice),
        );
        const totalFees = designFees + constructionFees;
        const balance = project.budget - totalFees;
        return (
            <tr key={index} className='position-relative'>
                <td className='pr-5' colSpan={2}>
                    <div className='d-flex text-nowrap overflow-hidden'>
                        <Badge variant='info'>{project.largeInvestment}</Badge>
                    </div>
                </td>
                <td className='pr-5' colSpan={2}>
                    <div className='d-flex text-nowrap overflow-hidden'>
                        {project.name}
                    </div>
                </td>
                <td className='pr-5' colSpan={2}>
                    <div className='d-flex text-nowrap overflow-hidden'>
                        {project.financialClassification}
                    </div>
                </td>
                <td className='pr-5' colSpan={2}>
                    <div className='d-flex text-nowrap overflow-hidden'>
                        {project.budgetPurpose}
                    </div>
                </td>
                <td className='pr-4'>{project.wbsLevel2}</td>
                <td />
                {isBreakdownShown && (
                    <>
                        {monthsAndYears.map((item: MonthsAndYears, index) => {
                            return (
                                <td key={index}>
                                    {project.wbs
                                        ? project.wbs[item]?.toLocaleString()
                                        : 0}
                                </td>
                            );
                        })}
                    </>
                )}
                <td className={styles.budget}>
                    {project.budget.toLocaleString()}円
                </td>
                <td className={styles.achievement}>
                    {totalFees.toLocaleString()}円
                </td>
                <td className={styles.difference}>
                    {Math.sign(balance) === -1
                        ? '△ ' + Math.abs(balance).toLocaleString()
                        : balance.toLocaleString()}
                    円
                </td>
                <td className={styles.action_button}>
                    <Link
                        href={`/designs/new?project_id=${project.id}`}
                        passHref
                    >
                        <Button
                            as='a'
                            variant='light'
                            className='bg-white border'
                        >
                            設計登録
                        </Button>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div className='mt-3 position-relative'>
            <div className='table-responsive' style={{ minHeight: '20vh' }}>
                <Table
                    className='table'
                    style={{
                        fontSize: '12px',
                        minHeight: isLoading ? '200px' : '',
                    }}
                >
                    <thead>
                        <tr className='position-relative'>
                            <th
                                style={{
                                    width: '130px',
                                }}
                            >
                                投資区分(大項目)
                            </th>
                            <th
                                style={{
                                    width: '1px',
                                    maxWidth: '250px',
                                    resize: 'horizontal',
                                    overflow: 'auto',
                                }}
                                className='pl-4'
                            >
                                <div className='d-flex justify-content-end'>
                                    <div
                                        style={{ width: '15px' }}
                                        className='border-right pr-3'
                                    >
                                        <div
                                            ref={
                                                isLargeInvestmentShown
                                                    ? filterIconRef
                                                    : null
                                            }
                                        >
                                            <FA
                                                icon={faFilter}
                                                className='text-muted'
                                                role='button'
                                                onClick={() => {
                                                    toggleFilters(
                                                        'largeInvestmentFilters',
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div
                                            className={styles.dropdown_filter}
                                            hidden={!isLargeInvestmentShown}
                                            ref={
                                                isLargeInvestmentShown
                                                    ? filterRef
                                                    : null
                                            }
                                        >
                                            <Form.Group className='d-flex flex-column'>
                                                {selectables.selectableLargeInvestments.map(
                                                    (
                                                        largeInvestment,
                                                        index,
                                                    ) => (
                                                        <Form.Check
                                                            key={index}
                                                            type='checkbox'
                                                            inline
                                                            className={
                                                                styles.form_check
                                                            }
                                                            label={
                                                                largeInvestment
                                                            }
                                                            value={
                                                                largeInvestment
                                                            }
                                                            checked={selectedLargeInvestments.includes(
                                                                largeInvestment,
                                                            )}
                                                            onChange={e =>
                                                                handleFilterCheckboxOnChange(
                                                                    'largeInvestmentFilters',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th
                                style={{
                                    width: '150px',
                                }}
                            >
                                プロジェクト名称
                            </th>
                            <th
                                style={{
                                    width: '1px',
                                    maxWidth: '250px',
                                    resize: 'horizontal',
                                    overflow: 'auto',
                                }}
                                className='pl-4'
                            >
                                <div className='d-flex justify-content-end align-items-center '>
                                    <div
                                        style={{ width: '15px' }}
                                        className=' pr-3 border-right'
                                    >
                                        <div
                                            ref={
                                                isProjectShown
                                                    ? filterIconRef
                                                    : null
                                            }
                                        >
                                            <FA
                                                icon={faFilter}
                                                className='text-muted'
                                                role='button'
                                                onClick={() =>
                                                    toggleFilters(
                                                        'projectFilters',
                                                    )
                                                }
                                            />
                                        </div>
                                        <div
                                            className={styles.dropdown_filter}
                                            hidden={!isProjectShown}
                                            ref={
                                                isProjectShown
                                                    ? filterRef
                                                    : null
                                            }
                                        >
                                            <Form.Group className='d-flex flex-column'>
                                                {selectables.selectableProjectNames.map(
                                                    (projectName, index) => (
                                                        <Form.Check
                                                            key={index}
                                                            type='checkbox'
                                                            inline
                                                            className={
                                                                styles.form_check
                                                            }
                                                            label={projectName}
                                                            value={projectName}
                                                            checked={selectedProjects.includes(
                                                                projectName,
                                                            )}
                                                            onChange={e =>
                                                                handleFilterCheckboxOnChange(
                                                                    'projectFilters',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th
                                style={{
                                    width: '135px',
                                }}
                            >
                                財務分類
                            </th>
                            <th
                                style={{
                                    width: '1px',
                                    maxWidth: '250px',
                                    resize: 'horizontal',
                                    overflow: 'auto',
                                }}
                                className='pl-4'
                            >
                                <div className='d-flex justify-content-end'>
                                    <div
                                        style={{ width: '15px' }}
                                        className=' pr-3 border-right'
                                    >
                                        <div
                                            ref={
                                                isClassificationShown
                                                    ? filterIconRef
                                                    : null
                                            }
                                        >
                                            <FA
                                                icon={faFilter}
                                                className='text-muted'
                                                role='button'
                                                onClick={() => {
                                                    toggleFilters(
                                                        'classificationFilters',
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div
                                            className={styles.dropdown_filter}
                                            hidden={!isClassificationShown}
                                            ref={
                                                isClassificationShown
                                                    ? filterRef
                                                    : null
                                            }
                                        >
                                            <Form.Group className='d-flex flex-column'>
                                                {selectables.selectableClassifications.map(
                                                    (
                                                        selectableClassifications,
                                                        index,
                                                    ) => (
                                                        <Form.Check
                                                            key={index}
                                                            type='checkbox'
                                                            inline
                                                            className={
                                                                styles.form_check
                                                            }
                                                            label={
                                                                selectableClassifications
                                                            }
                                                            value={
                                                                selectableClassifications
                                                            }
                                                            checked={selectedClassifications.includes(
                                                                selectableClassifications,
                                                            )}
                                                            onChange={e =>
                                                                handleFilterCheckboxOnChange(
                                                                    'classificationFilters',
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    ),
                                                )}
                                            </Form.Group>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th
                                style={{
                                    width: '145px',
                                }}
                            >
                                工事名称等
                            </th>
                            <th
                                style={{
                                    width: '1px',
                                    maxWidth: '250px',
                                    resize: 'horizontal',
                                    overflow: 'auto',
                                }}
                                className='pl-4'
                            >
                                <div className='d-flex justify-content-end '>
                                    <div
                                        style={{ width: '15px' }}
                                        className=' pr-3 border-right'
                                    >
                                        <div
                                            ref={
                                                isSearchShown
                                                    ? filterIconRef
                                                    : null
                                            }
                                        >
                                            <FA
                                                icon={faSearch}
                                                className='text-muted'
                                                role='button'
                                                onClick={() => {
                                                    setIsSearchShown(
                                                        !isSearchShown,
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div
                                            style={{ zIndex: 100 }}
                                            className={styles.search_filter}
                                            hidden={!isSearchShown}
                                            ref={
                                                isSearchShown ? filterRef : null
                                            }
                                        >
                                            <Form
                                                onSubmit={onSubmitSearchFilter}
                                            >
                                                <Form.Group className='d-flex flex-column p-2 m-0'>
                                                    <input
                                                        className='form-control'
                                                        placeholder='工事名称等を入力してください。'
                                                        value={searchFilter}
                                                        onChange={e =>
                                                            setSearchFilter(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </Form.Group>
                                                <Button
                                                    type='submit'
                                                    variant='light'
                                                    className='bg-white border m-2 float-right'
                                                >
                                                    検索
                                                </Button>
                                            </Form>
                                        </div>
                                    </div>
                                </div>
                            </th>
                            <th
                                style={{
                                    width: '140px',
                                    maxWidth: '350px',
                                    minWidth: '130px',
                                }}
                            >
                                WBSコード(Lv2)
                            </th>
                            <th style={{ width: '65px' }}>
                                <div
                                    ref={
                                        isWbsLevel2Shown ? filterIconRef : null
                                    }
                                    className='d-inline-block'
                                >
                                    <FA
                                        icon={faFilter}
                                        className='text-muted mr-3 '
                                        role='button'
                                        onClick={() =>
                                            toggleFilters('wbsLevel2Filters')
                                        }
                                    />
                                </div>
                                <div
                                    className={styles.dropdown_filter}
                                    hidden={!isWbsLevel2Shown}
                                    ref={isWbsLevel2Shown ? filterRef : null}
                                >
                                    <Form.Group className='d-flex flex-column'>
                                        {selectables.selectableWbsLevel2.map(
                                            (selectableWbsLevel2, index) => (
                                                <Form.Check
                                                    key={index}
                                                    type='checkbox'
                                                    inline
                                                    className={
                                                        styles.form_check
                                                    }
                                                    label={selectableWbsLevel2}
                                                    value={selectableWbsLevel2}
                                                    checked={selectedWbsLevel2Codes.includes(
                                                        selectableWbsLevel2,
                                                    )}
                                                    onChange={e =>
                                                        handleFilterCheckboxOnChange(
                                                            'wbsLevel2Filters',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            ),
                                        )}
                                    </Form.Group>
                                </div>
                                <FA
                                    icon={
                                        isBreakdownShown
                                            ? faMinusSquare
                                            : faPlusSquare
                                    }
                                    className='text-muted'
                                    role='button'
                                    onClick={() =>
                                        setIsBreakdownShown(!isBreakdownShown)
                                    }
                                />
                            </th>
                            {isBreakdownShown && (
                                <>
                                    {fiscalYearMonths.map((month, index) => (
                                        <th
                                            key={index}
                                            style={{ width: '90px' }}
                                            className='pr-0'
                                        >
                                            <div className='border-right'>
                                                {month}
                                            </div>
                                        </th>
                                    ))}
                                    <th
                                        style={{
                                            width: '90px',
                                            backgroundColor: '#f0fcf9',
                                        }}
                                        className='pr-0'
                                    >
                                        <div className='border-right'>
                                            年度計
                                        </div>
                                    </th>
                                    <th
                                        style={{ width: '90px' }}
                                        className='pr-0'
                                    >
                                        <div className='border-right'>
                                            2024年度
                                        </div>
                                    </th>
                                    <th
                                        style={{ width: '90px' }}
                                        className='pr-0'
                                    >
                                        <div className='border-right'>
                                            2025年度
                                        </div>
                                    </th>
                                    <th
                                        style={{ width: '90px' }}
                                        className='pr-0'
                                    >
                                        <div className='border-right'>
                                            2026年度
                                        </div>
                                    </th>
                                    <th
                                        style={{ width: '90px' }}
                                        className='pr-0'
                                    >
                                        <div className='border-right'>
                                            2027年度
                                        </div>
                                    </th>
                                    <th
                                        style={{
                                            width: '90px',
                                            backgroundColor: '#f0fcf9',
                                        }}
                                        className='pr-0'
                                    >
                                        中期合計
                                    </th>
                                </>
                            )}

                            <th className={styles.budget}>予算</th>
                            <th className={styles.achievement}>実績</th>
                            <th className={styles.difference}>差異</th>
                            <th className={styles.action_button} />
                        </tr>
                    </thead>
                    <tbody>{isLoading ? null : projectRows}</tbody>
                </Table>
            </div>
            {isLoading && (
                <div
                    className='text-center w-full m-auto d-flex align-items-center justify-content-center'
                    style={{
                        backgroundColor: '#F5F5F5',
                        position: 'absolute',
                        marginBottom: '20px',
                        top: '50%',
                        right: '50%',
                        left: '50%',
                    }}
                >
                    <div>
                        <Spinner animation='border' role='status' />
                    </div>
                </div>
            )}
        </div>
    );
};
