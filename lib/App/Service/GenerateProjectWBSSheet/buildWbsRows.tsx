import { ProjectsWithWBS } from '@/Domain/Entity';
import { Worksheet } from 'exceljs';

// TODO changed the types once wbs types is finalize
export default function buildWbsRows(
    sheet: Worksheet,
    projects: ProjectsWithWBS[],
): void {
    const START_ROW_INDEX = 7;

    for (let rowID = 0; rowID < projects.length; rowID++) {
        sheet.insertRow(START_ROW_INDEX + rowID, [
            rowID + 1,
            projects[rowID].largeInvestment,
            projects[rowID].mediumInvestment,
            projects[rowID].smallInvestment,
            projects[rowID].governmentReport,
            projects[rowID].wbsLevel1,
            projects[rowID].name,
            projects[rowID].financialClassification,
            projects[rowID].budgetPurpose,
            projects[rowID].segmentCode,
            projects[rowID].segmentName,
            projects[rowID].lineCode,
            projects[rowID].lineName,
            projects[rowID].stationCode,
            projects[rowID].stationName,
            projects[rowID].constructionSectionCode,
            projects[rowID].constructionSectionName,
            projects[rowID].wbs?.accountingCode,
            projects[rowID].wbs?.accountingName,
            projects[rowID].wbs?.assetClassCode,
            projects[rowID].wbs?.assetClassName,
            projects[rowID].wbs?.april?.toLocaleString() || 0,
            projects[rowID].wbs?.may?.toLocaleString() || 0,
            projects[rowID].wbs?.june?.toLocaleString() || 0,
            projects[rowID].wbs?.july?.toLocaleString() || 0,
            projects[rowID].wbs?.august?.toLocaleString() || 0,
            projects[rowID].wbs?.september?.toLocaleString() || 0,
            projects[rowID].wbs?.october?.toLocaleString() || 0,
            projects[rowID].wbs?.november?.toLocaleString() || 0,
            projects[rowID].wbs?.december?.toLocaleString() || 0,
            projects[rowID].wbs?.january?.toLocaleString() || 0,
            projects[rowID].wbs?.february?.toLocaleString() || 0,
            projects[rowID].wbs?.march?.toLocaleString() || 0,
            projects[rowID].wbs?.annualTotal?.toLocaleString() || 0,
            projects[rowID].wbs?.firstYear?.toLocaleString() || 0,
            projects[rowID].wbs?.secondYear?.toLocaleString() || 0,
            projects[rowID].wbs?.thirdYear?.toLocaleString() || 0,
            projects[rowID].wbs?.fourthYear?.toLocaleString() || 0,
            projects[rowID].wbs?.midtermTotal?.toLocaleString() || 0,
            projects[rowID].wbsLevel2,
            projects[rowID].inputLevel2,
            projects[rowID].spareItem1,
            projects[rowID].spareItem2,
            projects[rowID].spareItem3,
        ]);
    }
}
