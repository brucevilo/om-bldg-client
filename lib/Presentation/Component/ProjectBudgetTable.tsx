import React, { FC, useState } from 'react';
import { FontAwesomeIcon as FA } from '@fortawesome/react-fontawesome';
import {
    faChevronDown,
    faChevronRight,
    faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Table, Popover, OverlayTrigger, Spinner } from 'react-bootstrap';
import { ProjectBudgetMonthsTotalColumn } from '.';
import {
    groupProjects,
    getMonthlyOrYearlyBudget,
    months,
    years,
} from '@/App/Service';
import { ProjectByYearWithWBS } from '@/Domain/Entity/ProjectWbsByYear';

interface Props {
    projectsByYear: ProjectByYearWithWBS[];
    isLoading: boolean;
}

const monthsIndexes = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const currentMonth = new Date().getMonth();
const lightGrayColor = '#EDEDED';
const lightBlueColor = '#CFE2FF';

const getTableHeaderColor = (month: number) => {
    return currentMonth == month && 'bg-primary text-white';
};

const getTableBodyColor = (month: number) => {
    return currentMonth == month && lightBlueColor;
};

const renderMonthsHeader = () => {
    return monthsIndexes.map(monthIndex => {
        return (
            <th
                key={monthIndex}
                className={`text-center border ${getTableHeaderColor(
                    monthIndex - 1,
                )}`}
                style={{
                    width: '85px',
                }}
            >
                {monthIndex}月
            </th>
        );
    });
};

const renderMonthsBody = (
    monthIndexOrYear: string | number,
    budget: number,
    isFontRed = false,
) => {
    const style = {
        ...(typeof monthIndexOrYear === 'number' && {
            backgroundColor: `${getTableBodyColor(monthIndexOrYear - 1)}`,
            ...(isFontRed && { color: 'red' }),
        }),
    };
    return (
        <td key={monthIndexOrYear} className='border' style={style}>
            {budget?.toLocaleString() || '-'}
        </td>
    );
};

const renderYearHeader = (year: number) => {
    return Array(4)
        .fill('')
        .map((item, index) => (
            <th
                key={index}
                className='text-center align-middle border'
                style={{
                    width: '85px',
                    height: '',
                }}
                rowSpan={2}
            >
                {Number(year) + Number(index) + 1}年度
            </th>
        ));
};

export const ProjectBudgetTable: FC<Props> = ({
    projectsByYear,
    isLoading,
}) => {
    const [selectedWbsLevel1Codes, setSelectedWbsLevel1Codes] = useState<
        string[]
    >([]);
    const groupedProjects = groupProjects(projectsByYear);

    const onToggleWbsDropdown = (wbsLevel1: string) => {
        setSelectedWbsLevel1Codes(prevSelection => {
            if (prevSelection.includes(wbsLevel1)) {
                return prevSelection.filter(i => i !== wbsLevel1);
            }
            return [...prevSelection, wbsLevel1];
        });
    };

    const renderTotalsRow = (
        projects: ProjectByYearWithWBS[],
        group: string,
    ) => {
        const initialSum = monthsIndexes
            .map(monthIndex =>
                getMonthlyOrYearlyBudget(
                    projects,
                    months[monthIndex - 1],
                    'initialBudget',
                ),
            )
            .reduce((partialSum, a) => partialSum + a, 0);
        const currentSum = monthsIndexes
            .map(monthIndex =>
                getMonthlyOrYearlyBudget(
                    projects,
                    months[monthIndex - 1],
                    'actualBudget',
                ),
            )
            .reduce((partialSum, a) => partialSum + a, 0);
        return (
            <>
                <tr>
                    <td
                        className='bg-light position-sticky p-0'
                        style={{
                            left: '-1px',
                            top: '0',
                        }}
                        rowSpan={2}
                    >
                        <div className='d-flex align-items-center'>
                            <div
                                style={{
                                    cursor: 'pointer',
                                }}
                            >
                                <button
                                    className='btn bg-transparent'
                                    onClick={() => onToggleWbsDropdown(group)}
                                >
                                    <FA
                                        icon={
                                            selectedWbsLevel1Codes.includes(
                                                group,
                                            )
                                                ? faChevronDown
                                                : faChevronRight
                                        }
                                    />
                                </button>
                            </div>
                            <div>{projects[0].wbsLevel1}</div>
                        </div>
                    </td>
                    <td className='border'>当初</td>
                    {monthsIndexes.map(monthIndex =>
                        renderMonthsBody(
                            monthIndex,
                            getMonthlyOrYearlyBudget(
                                projects,
                                months[monthIndex - 1],
                                'initialBudget',
                            ),
                        ),
                    )}
                    {years.map(year =>
                        renderMonthsBody(
                            year,
                            getMonthlyOrYearlyBudget(
                                projects,
                                year,
                                'initialBudget',
                            ),
                        ),
                    )}
                    <ProjectBudgetMonthsTotalColumn
                        rowSpan={1}
                        backgroundColor='#f5f5f5'
                    >
                        <span className='pl-2'>
                            {initialSum?.toLocaleString() || '-'}
                        </span>
                    </ProjectBudgetMonthsTotalColumn>
                </tr>
                <tr>
                    <td className='border'>現状</td>
                    {monthsIndexes.map(monthIndex =>
                        renderMonthsBody(
                            monthIndex,
                            getMonthlyOrYearlyBudget(
                                projects,
                                months[monthIndex - 1],
                                'actualBudget',
                            ),
                        ),
                    )}
                    {years.map(year =>
                        renderMonthsBody(
                            year,
                            getMonthlyOrYearlyBudget(
                                projects,
                                year,
                                'actualBudget',
                            ),
                        ),
                    )}
                    <ProjectBudgetMonthsTotalColumn
                        rowSpan={1}
                        backgroundColor='#f5f5f5'
                    >
                        <span className='pl-2'>
                            {currentSum?.toLocaleString() || '-'}
                        </span>
                    </ProjectBudgetMonthsTotalColumn>
                </tr>
            </>
        );
    };

    const renderBudgetBreakdown = (project: ProjectByYearWithWBS) => {
        // gets the sum of initial budget for the current year'
        const initialSum = months
            .map(month =>
                project.initialBudget ? project.initialBudget[month] : 0,
            )
            .reduce((partialSum, a) => partialSum + a, 0);
        // gets the sum of construction statement history for the current year
        const currentSum = months
            .map(month =>
                project.actualBudget ? project.actualBudget[month] : 0,
            )
            .reduce((partialSum, a) => partialSum + a, 0);

        const showTrigger = monthsIndexes.some(monthIndex => {
            const initialBudget = project.initialBudget
                ? project.initialBudget[months[monthIndex - 1]]
                : 0;
            const actualBudget = project.actualBudget
                ? project.actualBudget[months[monthIndex - 1]]
                : 0;
            return initialBudget < actualBudget;
        });

        return (
            <React.Fragment key={project.name}>
                <tr className='bg-white'>
                    <td
                        className='position-sticky bg-white text-truncate p-3'
                        style={{
                            left: '-1px',
                            top: '0',
                        }}
                        rowSpan={2}
                    >
                        {project.name}
                    </td>
                    <td className='border'>当初</td>

                    {monthsIndexes.map(monthIndex =>
                        renderMonthsBody(
                            monthIndex,
                            project.initialBudget
                                ? project.initialBudget[months[monthIndex - 1]]
                                : 0,
                        ),
                    )}
                    {years.map(year => {
                        return renderMonthsBody(
                            year,
                            project.initialBudget
                                ? project.initialBudget[year]
                                : 0,
                        );
                    })}
                    <ProjectBudgetMonthsTotalColumn
                        rowSpan={1}
                        backgroundColor='white'
                    >
                        <span className='pl-2'>
                            {initialSum?.toLocaleString() || '-'}
                        </span>
                    </ProjectBudgetMonthsTotalColumn>
                </tr>
                <tr className='bg-white'>
                    <td className='border'>現状</td>
                    {monthsIndexes.map(monthIndex => {
                        const initialBudget = project.initialBudget
                            ? project.initialBudget[months[monthIndex - 1]]
                            : 0;
                        const actualBudget = project.actualBudget
                            ? project.actualBudget[months[monthIndex - 1]]
                            : 0;
                        const isFontRed = actualBudget > initialBudget;

                        return renderMonthsBody(
                            monthIndex,
                            actualBudget,
                            isFontRed,
                        );
                    })}
                    {years.map(year =>
                        renderMonthsBody(
                            year,
                            project.actualBudget
                                ? project.actualBudget[year]
                                : 0,
                        ),
                    )}
                    <ProjectBudgetMonthsTotalColumn
                        rowSpan={1}
                        backgroundColor='white'
                    >
                        <div
                            className='pl-2 pt-1'
                            style={{
                                backgroundColor: showTrigger ? '#F6DDE3' : '',
                                height: '39.6px',
                            }}
                        >
                            {showTrigger && (
                                <OverlayTrigger
                                    trigger='click'
                                    key='top'
                                    rootClose
                                    placement='top'
                                    overlay={
                                        <Popover id={`popover-positioned-top`}>
                                            <div>
                                                {project.owner}
                                                んが金額を¥
                                                {project.prevCsHistory?.toLocaleString()}
                                                から
                                                {project.latestCsHistory?.toLocaleString()}
                                                へ変更しました。 変更理由 ：
                                                {project.reasonForChange}
                                            </div>
                                        </Popover>
                                    }
                                >
                                    <button
                                        style={{
                                            color: '#F83760',
                                        }}
                                        className='btn p-0 pr-1 bg-transparent'
                                    >
                                        <FA icon={faInfoCircle} />
                                    </button>
                                </OverlayTrigger>
                            )}
                            {currentSum?.toLocaleString() || '-'}
                        </div>
                    </ProjectBudgetMonthsTotalColumn>
                </tr>
            </React.Fragment>
        );
    };

    return (
        <div className='mt-3 position-relative'>
            <div className='table-responsive'>
                <Table
                    className='table table-sm border p-1 bg-light'
                    style={{
                        fontSize: '12px',
                        lineHeight: '2.5',
                        minHeight: isLoading ? '200px' : '',
                    }}
                >
                    <thead style={{ backgroundColor: lightGrayColor }}>
                        <tr className='position-relative'>
                            <th
                                className='text-left align-middle position-sticky p-3'
                                style={{
                                    width: '195px',
                                    zIndex: '1',
                                    left: '-1px',
                                    top: '0',
                                    backgroundColor: lightGrayColor,
                                }}
                                rowSpan={2}
                            >
                                WBSコード
                            </th>
                            <th
                                className='border'
                                style={{
                                    width: '60px',
                                }}
                                rowSpan={2}
                            />
                            <th
                                className='border text-center'
                                style={{
                                    width: '1020px',
                                }}
                                colSpan={12}
                            >
                                {projectsByYear[0]?.targetYear || ''}年度
                            </th>
                            {renderYearHeader(
                                projectsByYear[0]?.targetYear || 0,
                            )}
                            <ProjectBudgetMonthsTotalColumn
                                rowSpan={2}
                                backgroundColor='#EDEDED'
                                textCenter
                            >
                                <span className='pl-2'>年度計（円）</span>
                            </ProjectBudgetMonthsTotalColumn>
                        </tr>
                        <tr>{renderMonthsHeader()}</tr>
                    </thead>
                    <tbody>
                        {isLoading ? null : !groupedProjects ? (
                            <tr>
                                <td
                                    className='text-center'
                                    style={{
                                        backgroundColor: '#F5F5F5',
                                        position: 'absolute',
                                        marginBottom: '20px',
                                        top: '50%',
                                        right: '50%',
                                        left: '50%',
                                    }}
                                >
                                    <Spinner animation='border' role='status' />
                                </td>
                            </tr>
                        ) : (
                            Object.entries(groupedProjects).map(
                                ([key, projects]) => (
                                    <React.Fragment key={key}>
                                        {renderTotalsRow(projects, key)}
                                        {selectedWbsLevel1Codes.includes(key) &&
                                            projects.map(project =>
                                                renderBudgetBreakdown(project),
                                            )}
                                    </React.Fragment>
                                ),
                            )
                        )}
                    </tbody>
                </Table>
            </div>
            {isLoading && (
                <div
                    className='text-center w-full m-auto d-flex align-items-center justify-content-center'
                    style={{
                        backgroundColor: '#F5F5F5',
                        position: 'absolute',
                        marginBottom: '20px',
                        top: '60%',
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
