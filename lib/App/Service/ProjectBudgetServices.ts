import { useContext } from 'react';
import { ConstructionStatementHistory } from '@/Domain/Entity';
import {
    ProjectByYearWithWBS,
    WbsByYear,
} from '@/Domain/Entity/ProjectWbsByYear';
import { groupBy } from 'lodash';
import { MasterContext } from '@/Presentation/Context';

export const years = [
    'firstYear',
    'secondYear',
    'thirdYear',
    'fourthYear',
] as const;

type Year = typeof years[number];

export const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
] as const;

export type Month = typeof months[number];

export type LatestConstructionStatementHistories = {
    [key in Month | Year]?: ConstructionStatementHistory;
};

export const getMonthlyOrYearlyBudget = (
    projects: ProjectByYearWithWBS[],
    monthOrYear: Month | Year,
    budgetType: 'actualBudget' | 'initialBudget',
): number => {
    return projects
        .map(project => {
            return project[budgetType]
                ? (project[budgetType] as WbsByYear)[monthOrYear]
                : 0;
        })
        .reduce((prev, current) => prev + current);
};
/**
 * Given an array of construction statement histories.
 * Gets the latest cs history per month,
 * @param ConstructionStatementHistory array of construction statement histories of type ConstructionStatementHistory[]
 * @returns an object e.g. {january: csHistory...}
 */
export const getLatestConstructionStatementHistoryPerMonth = (
    constructionStatementHistories: ConstructionStatementHistory[],
): LatestConstructionStatementHistories => {
    const latestConstructionStatementHistories: LatestConstructionStatementHistories =
        {};
    constructionStatementHistories.forEach(constructionStatementHistory => {
        const constructionStatementHistoryMonth =
            months[constructionStatementHistory.createdAt.getMonth()];
        const monthlyLatestConstructionStateSHistory =
            latestConstructionStatementHistories[
                constructionStatementHistoryMonth
            ];

        if (
            !monthlyLatestConstructionStateSHistory ||
            monthlyLatestConstructionStateSHistory.createdAt <
                constructionStatementHistory.createdAt
        ) {
            latestConstructionStatementHistories[
                constructionStatementHistoryMonth
            ] = constructionStatementHistory;
        }
    });

    return latestConstructionStatementHistories;
};

/**
 * Given an array of construction statement histories.
 * Gets the latest cs history per month,
 * @param csHistory array of construction statement histories of type ConstructionStatementHistory[]
 * @returns an object e.g. {latest: csHistory, previous: csHistory}
 */
export const getLatestAndPrevCsHistory = (
    csHistories: ConstructionStatementHistory[],
): {
    latestCSHistories: ConstructionStatementHistory | null;
    prevCSHistories: ConstructionStatementHistory | null;
} => {
    let latestCSHistories: ConstructionStatementHistory | null = null;
    let prevCSHistories: ConstructionStatementHistory | null = null;

    csHistories.forEach(csHistories => {
        const csHistoryDate = latestCSHistories?.createdAt;

        if (!csHistoryDate || csHistoryDate < csHistories.createdAt) {
            prevCSHistories = latestCSHistories;
            latestCSHistories = csHistories;
        }
    });

    return { latestCSHistories, prevCSHistories };
};

/**
 * Groups projects based on their wbsLevel1
 * After grouping the projects, combines the projects with the same name
 * Adds the wbs and constructionStatementHistories of the combined projects
 * @param projectsByYear array of projects of type ProjectByYearWithWBS[]
 * @returns an object e.g. {wbsLevel1_1: [array of projects], wbsLevel1_2: [array of projects]...}
 */
export const groupProjects = (
    projectsByYear: ProjectByYearWithWBS[],
): Record<string, ProjectByYearWithWBS[]> => {
    // group projects with same wbsLevel1 and constructionName
    const groupedProjects = groupBy(
        projectsByYear,
        ({ wbsLevel1, name }) => `${wbsLevel1}_${name}`,
    );

    // map through the sorted projects, need to sum up all the wbs and construction statement history values
    const formattedProjects: ProjectByYearWithWBS[] = Object.values(
        groupedProjects,
    ).map(projectArray => {
        // create a temporary project that will have the summed up wbs values
        const formattedProject = {
            id: projectArray[0].id,
            name: projectArray[0].name,
            targetYear: projectArray[0].targetYear,
            wbsLevel1: projectArray[0].wbsLevel1,
            constructionStatementHistory: [],
            wbs: {} as WbsByYear,
            latestCsHistory: {} as number,
            prevCsHistory: {} as number,
            initialBudget: {} as WbsByYear,
            actualBudget: {} as WbsByYear,
            reasonForChange: {} as string,
            owner: {} as string,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const monthAndYear = [...months, ...years];
        monthAndYear.forEach(monthOrYear => {
            // get the sum of all projects' wbs based on current month or year
            const initialTotal = projectArray
                .map(project => (project.wbs ? project.wbs[monthOrYear] : 0))
                .reduce((prev, current) => prev + current);

            // get the sum of construction statement history of projects in the same group
            const constructions = projectArray
                .map(project => project.constructions)
                .flat();

            const contracts = constructions
                .map(construction => construction?.contracts)
                .flat();

            const ownerId = contracts[0]?.ownerId;

            const { users } = useContext(MasterContext);

            const getOwnerName = users.find(users => {
                return users.id == ownerId;
            });

            const constructionStatements = contracts
                .map(contract => contract?.constructionStatements)
                .flat();

            const constructionStatementHistories = constructionStatements
                .map(
                    constructionStatement =>
                        constructionStatement?.constructionStatementHistories ||
                        [],
                )
                .flat();
            const historyPerMonth =
                getLatestConstructionStatementHistoryPerMonth(
                    constructionStatementHistories,
                );
            const actualTotal =
                (historyPerMonth[monthOrYear]?.assetDifference || 0) +
                (historyPerMonth[monthOrYear]?.repairFeeDifference || 0) +
                (historyPerMonth[monthOrYear]?.removalFeeDifference || 0);

            const latestAndPrevCsHistory = getLatestAndPrevCsHistory(
                constructionStatementHistories,
            );

            // formattedProject.latestCsHistory = latestCsHistory[0];
            // save the calculated totals to formattedProject
            const prevCsHistoryTotal =
                (latestAndPrevCsHistory.prevCSHistories?.assetDifference || 0) +
                (latestAndPrevCsHistory.prevCSHistories?.removalFeeDifference ||
                    0) +
                (latestAndPrevCsHistory.prevCSHistories?.repairFeeDifference ||
                    0);

            const latestCsHistoryTotal =
                (latestAndPrevCsHistory.latestCSHistories?.assetDifference ||
                    0) +
                (latestAndPrevCsHistory.latestCSHistories
                    ?.removalFeeDifference || 0) +
                (latestAndPrevCsHistory.latestCSHistories
                    ?.repairFeeDifference || 0);

            formattedProject.owner = getOwnerName?.name || '';
            formattedProject.prevCsHistory = prevCsHistoryTotal;
            formattedProject.latestCsHistory = latestCsHistoryTotal;
            formattedProject.reasonForChange =
                latestAndPrevCsHistory.latestCSHistories?.reasonForChange || '';
            formattedProject.initialBudget[monthOrYear] = initialTotal;
            formattedProject.actualBudget[monthOrYear] = actualTotal;
        });

        return formattedProject;
    });

    // group projects with same wbsLevel1
    return groupBy(formattedProjects, 'wbsLevel1');
};

export const calculateTotalScheduledChange = (
    history: ConstructionStatementHistory,
): string => {
    const asset = history.assetDifference || 0;
    const repairFee = history.repairFeeDifference || 0;
    const removalFee = history.removalFeeDifference || 0;

    return (asset + repairFee + removalFee).toLocaleString();
};
