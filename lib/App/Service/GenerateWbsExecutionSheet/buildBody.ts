import { Supplier } from './../../../Domain/Entity/Supplier';
import {
    getLatestConstructionStatementHistoryPerMonth,
    LatestConstructionStatementHistories,
    Month,
} from './../ProjectBudgetServices';
import { Contract } from './../../../Domain/Entity/Contract';
import { Construction } from './../../../Domain/Entity/Construction';
import { ProjectByYearWithWBSAndCS } from '@/Domain/Entity/ProjectWbsByYearAndCS';
import { Worksheet } from 'exceljs';
import {
    alignRight,
    alignCenter,
    grayFill,
    lightGrayFill,
    whiteBorder,
    yellowFill,
    whiteFill,
    defaultBorder,
} from './cellStyles';
import { ConstructionStatementHistory, WBS } from '@/Domain/Entity';

type MonthlyData = {
    [month: string]: number;
};
interface monthlyCSHistory {
    [key: string]: ConstructionStatementHistory;
}

const columns =
    `B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK`.split(
        ',',
    );
const rightAlignedColumns =
    'P,Q,R,S,T,U,V,W,X,Y,Z,AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ'.split(',');

const totalOfActualAmountAllMonth = (month: MonthlyData): number => {
    const values = Object.values(month);
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((acc, val) => acc + val);
};
const getValue = (input: string): string => {
    if (input.includes('資産')) {
        return '投資';
    } else if (input.includes('費用')) {
        return '収支';
    } else {
        return '受託';
    }
};
export default function buildBody(
    sheet: Worksheet,
    wbsLists: ProjectByYearWithWBSAndCS[],
    suppliers: Supplier[],
): void {
    let currentRow = 3;
    wbsLists.forEach((wbsList, index) => {
        populateGrayCells(sheet, wbsList, currentRow, index);
        formatGrayCells(sheet, currentRow);
        populateYellowCells(sheet, wbsList, currentRow + 1, index, wbsList.wbs);
        formatYellowCells(sheet, currentRow + 1);

        wbsList.constructions?.forEach(construction => {
            populateWhiteCells(
                sheet,
                wbsList,
                currentRow + 2,
                index,
                construction,
                suppliers,
                wbsList?.wbs,
            ),
                formatWhiteCells(sheet, currentRow + 2);
            currentRow++;
        });
        buildSpacer(sheet, currentRow + 3);
        const contracts = wbsList?.constructions
            ?.map((construction: Construction) => construction?.contracts)
            .flat();
        const constructionStatements = contracts
            ?.map(contract => contract?.constructionStatements)
            .flat();

        buildSpacer(
            sheet,
            currentRow + (constructionStatements?.length || 0) + 2,
        );
        currentRow += (constructionStatements?.length || 0) + 3;
    });
}

const getLatestCsHistoryGroupedByMonth = (
    wbsList: ProjectByYearWithWBSAndCS,
): MonthlyData => {
    const latestMonth = wbsList.constructions?.map(construction => {
        const constructionStatements = construction.contracts
            ?.map(contract => contract?.constructionStatements)
            .flat();
        const constructionStatementHistories = constructionStatements
            ?.map(
                constructionStatement =>
                    constructionStatement?.constructionStatementHistories || [],
            )
            .flat();
        return getLatestConstructionStatementHistoryPerMonth(
            constructionStatementHistories || [],
        );
    });

    const months = latestMonth?.flatMap(Object.keys);
    const sumOfEachMonthActualAmount: { [key: string]: number } = {};

    months?.map(month =>
        Object.assign(sumOfEachMonthActualAmount, { [month]: 0 }),
    );
    latestMonth?.map(obj => {
        Object.entries(obj).map(costructionStatementHistory => {
            if (months?.includes(costructionStatementHistory[0] as Month)) {
                sumOfEachMonthActualAmount[costructionStatementHistory[0]] +=
                    costructionStatementHistory[1]?.assetDifference +
                    costructionStatementHistory[1]?.removalFeeDifference +
                    costructionStatementHistory[1]?.repairFeeDifference;
            }
        });
    });

    return sumOfEachMonthActualAmount;
};

const populateGrayCells = (
    sheet: Worksheet,
    wbsList: ProjectByYearWithWBSAndCS,
    row: number,
    index: number,
): void => {
    sheet.insertRow(row, [
        '',
        index + 1,
        wbsList.id,
        wbsList.name,
        wbsList.code,
        wbsList.financialClassification,
        wbsList.budgetPurpose,
        wbsList.wbs?.assetClassName,
        '技. 建築家',
        wbsList.wbs?.constructionSectionName,
        '-',
        '-',
        '-',
        '-',
        '-',
        wbsList.wbs?.april?.toLocaleString() || '0',
        wbsList.wbs?.may?.toLocaleString() || '0',
        wbsList.wbs?.june?.toLocaleString() || '0',
        wbsList.wbs?.july?.toLocaleString() || '0',
        wbsList.wbs?.august?.toLocaleString() || '0',
        wbsList.wbs?.september?.toLocaleString() || '0',
        wbsList.wbs?.october?.toLocaleString() || '0',
        wbsList.wbs?.november?.toLocaleString() || '0',
        wbsList.wbs?.december?.toLocaleString() || '0',
        wbsList.wbs?.january?.toLocaleString() || '0',
        wbsList.wbs?.february?.toLocaleString() || '0',
        wbsList.wbs?.march?.toLocaleString() || '0',
        wbsList.wbs?.annualTotal?.toLocaleString() || '0',
        '0',
        '0',
        '0',
        wbsList.wbs?.thirdYear?.toLocaleString() || '0',
        wbsList.wbs?.fourthYear?.toLocaleString() || '0',
        (
            (wbsList.wbs?.firstYear || 0) +
            (wbsList.wbs?.secondYear || 0) +
            (wbsList.wbs?.thirdYear || 0) +
            (wbsList.wbs?.fourthYear || 0)
        ).toLocaleString(),
        wbsList.wbsLevel1,
        wbsList.wbsLevel2,
        wbsList.segmentCode,
        '○',
        getValue(wbsList.financialClassification),
        '',
        '',
        (
            Number(wbsList.wbs?.annualTotal || '0') -
            totalOfActualAmountAllMonth(
                getLatestCsHistoryGroupedByMonth(wbsList),
            )
        ).toLocaleString(),
        '差額理由記入→',
        '',
        '',
        '0',
        '',
        '',
        '',
    ]);
};

const formatGrayCells = (sheet: Worksheet, row: number): void => {
    columns.map(col => {
        const cell = sheet.getCell(`${col}${row}`);

        if (rightAlignedColumns.includes(col)) {
            cell.alignment = alignRight;
        }

        cell.fill = grayFill;
        cell.border = whiteBorder;
    });
};

const populateYellowCells = (
    sheet: Worksheet,
    wbsList: ProjectByYearWithWBSAndCS,
    row: number,
    index: number,
    wbs?: WBS | null,
): void => {
    const sumOfEachMonthActualAmount =
        getLatestCsHistoryGroupedByMonth(wbsList);
    sheet.insertRow(row, [
        '',
        index + 1,
        wbsList.id,
        '-',
        '-',
        '-',
        '執行集計',
        '-',
        '技. 建築家',
        '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        sumOfEachMonthActualAmount?.april?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.may?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.june?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.july?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.august?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.september?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.october?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.november?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.december?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.january?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.february?.toLocaleString() || '0',
        sumOfEachMonthActualAmount?.march?.toLocaleString() || '0',
        totalOfActualAmountAllMonth(
            sumOfEachMonthActualAmount,
        ).toLocaleString() || '0',
        '0',
        '0',
        '0',
        wbs?.thirdYear?.toLocaleString() || '0',
        wbs?.fourthYear?.toLocaleString() || '0',
        (
            (wbs?.firstYear || 0) +
            (wbs?.secondYear || 0) +
            (wbs?.thirdYear || 0) +
            (wbs?.fourthYear || 0)
        ).toLocaleString(),
        '',
        wbsList.wbsLevel2,
        wbsList.segmentCode,
        '●',
        getValue(wbsList.financialClassification),
        '',
        '',
        (
            Number(wbsList.wbs?.annualTotal || '0') -
            totalOfActualAmountAllMonth(sumOfEachMonthActualAmount)
        ).toLocaleString(),
        '差額理由記入→',
        '',
        '',
        '0',
        '',
        '',
        '',
    ]);
};

const formatYellowCells = (sheet: Worksheet, row: number): void => {
    columns.forEach(col => {
        const cell = sheet.getCell(`${col}${row}`);

        if (rightAlignedColumns.includes(col)) {
            cell.alignment = alignRight;
        }
        cell.fill = yellowFill;
        cell.border = whiteBorder;
    });
};

const populateWhiteCells = (
    sheet: Worksheet,
    wbsList: ProjectByYearWithWBSAndCS,
    row: number,
    index: number,
    construction: Construction,
    suppliers: Supplier[],
    wbs?: WBS | null,
): void => {
    const contract: Contract[] = construction.contracts;
    const constructionStatements = contract
        ?.map(contract => contract?.constructionStatements)
        .flat();

    const constructionStatementHistories = constructionStatements
        ?.map(
            constructionStatement =>
                constructionStatement?.constructionStatementHistories || [],
        )
        .flat();

    const latestMonth: LatestConstructionStatementHistories =
        getLatestConstructionStatementHistoryPerMonth(
            constructionStatementHistories,
        );

    const getDifference = (month: ConstructionStatementHistory | undefined) => {
        if (!month) {
            return 0;
        }
        return (
            (month?.assetDifference | 0) +
            (month?.removalFeeDifference | 0) +
            (month?.repairFeeDifference | 0)
        );
    };

    const renderSupplier = (supplierId: number | null) => {
        const supplier = suppliers.find(supplier => supplier.id === supplierId);

        return supplier ? supplier.name : '--';
    };

    const calculateTotal = (csHistories: monthlyCSHistory) => {
        let total = 0;
        Object.keys(csHistories).forEach(csHistory => {
            const monthlyData = csHistories[csHistory];
            const monthlyTotal =
                monthlyData.assetDifference +
                monthlyData.removalFeeDifference +
                monthlyData.repairFeeDifference;
            total += monthlyTotal;
        });
        return total;
    };

    sheet.insertRow(row, [
        '',
        index + 1,
        wbsList.id,
        '-',
        '-',
        '-',
        construction.name,
        '',
        '技. 建築家',
        '-',
        '-',
        renderSupplier(contract[0].supplierId),
        contract[0].contractAt?.toISOString() || '-',
        contract[0].completedAt?.toISOString() || '-',
        '-',
        getDifference(latestMonth?.april).toLocaleString() || '0',
        getDifference(latestMonth?.may).toLocaleString() || '0',
        getDifference(latestMonth?.june).toLocaleString() || '0',
        getDifference(latestMonth?.july).toLocaleString() || '0',
        getDifference(latestMonth?.august).toLocaleString() || '0',
        getDifference(latestMonth?.september).toLocaleString() || '0',
        getDifference(latestMonth?.october).toLocaleString() || '0',
        getDifference(latestMonth?.november).toLocaleString() || '0',
        getDifference(latestMonth?.december).toLocaleString() || '0',
        getDifference(latestMonth?.january).toLocaleString() || '0',
        getDifference(latestMonth?.february).toLocaleString() || '0',
        getDifference(latestMonth?.march).toLocaleString() || '0',
        calculateTotal(latestMonth).toLocaleString() || '0',
        '0',
        '0',
        '0',
        wbs?.thirdYear?.toLocaleString() || '0',
        wbs?.fourthYear?.toLocaleString() || '0',
        (
            (wbs?.firstYear || 0) +
            (wbs?.secondYear || 0) +
            (wbs?.thirdYear || 0) +
            (wbs?.fourthYear || 0)
        ).toLocaleString(),
        wbsList.wbsLevel1,
        wbsList.wbsLevel2,
        wbsList.segmentCode,
        '',
        '',
        '',
        '',
    ]);
};

const formatWhiteCells = (sheet: Worksheet, row: number): void => {
    columns.forEach(col => {
        const cell = sheet.getCell(`${col}${row}`);

        if (rightAlignedColumns.includes(col)) {
            cell.alignment = alignRight;
        }
        cell.fill = whiteFill;
        cell.border = defaultBorder;
    });
};

const buildSpacer = (sheet: Worksheet, row: number): void => {
    columns.forEach(col => {
        const cell = sheet.getCell(`${col}${row}`);
        cell.value = '-';

        cell.fill = lightGrayFill;
        cell.border = whiteBorder;
        cell.alignment = alignCenter;
    });
};
