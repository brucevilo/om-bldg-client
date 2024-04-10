import ExcelJS, { Workbook } from 'exceljs';
import { DateTime } from 'luxon';
import buildHeaderRows from './buildHeaderRows';
import buildWbsRows from './buildWbsRows';
import setStyle from './setStyle';
import { ProjectsWithWBS } from '@/Domain/Entity';

export const generateProjectWBSSheet = async (
    projectsWithWBS: ProjectsWithWBS[],
): Promise<void> => {
    const currentYear = new Date().getFullYear();
    const currentYearProjects = projectsWithWBS.filter(
        project => project.targetYear == currentYear,
    );

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('WBS管理シート');
    const worksheet = workbook.getWorksheet('WBS管理シート');

    buildHeaderRows(
        worksheet,
        currentYearProjects[0].targetYear,
        currentYearProjects[0].budgetDivision,
    );
    buildWbsRows(worksheet, currentYearProjects);
    setStyle(worksheet);
    downloadWorkBook(workbook, currentYearProjects[0].targetYear);
};

async function downloadWorkBook(workbook: Workbook, targetYear: number) {
    const uint8Array = await workbook.xlsx.writeBuffer();
    const blob = new Blob([uint8Array], {
        type: 'application/octet-binary',
    });
    const url = window.URL.createObjectURL(blob);
    const anchorElement = document.createElement('a');
    const currentDate = DateTime.fromJSDate(new Date()).toFormat('yyyyMMdd');
    anchorElement.href = url;
    anchorElement.download = `建築課${targetYear}_WBS管理シート_${currentDate}.xlsm`;
    anchorElement.click();
    anchorElement.remove();
}
