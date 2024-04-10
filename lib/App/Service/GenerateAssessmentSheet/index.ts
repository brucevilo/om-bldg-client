import ExcelJS, { Workbook, Worksheet } from 'exceljs';
import { Assessment } from '@/Domain/ValueObject';
import { Construction, Design } from '@/Domain/Entity';
import buildCoverRows from './buildCoverRows';
import buildSummaryRows from './buildSummaryRows';
import buildDetailRows from './buildDetailRows';
import getPartSummariesFromAssessment from './getPartSummariesFromAssesment';
import { AssessmentStatementRepository } from '@/Domain/Repository/AssesmentStatementRepository';
import { buildAssessment } from '@/Domain/Service/CreateNewAssessmentService/buildAssessment';

export const generateAssessment = async (
    contractable: Construction | Design,
    currentAssessment: Assessment,
): Promise<void> => {
    const previousAssessment =
        contractable.firstContract.id === currentAssessment.contract.id
            ? currentAssessment
            : await getPreviousAssessment(currentAssessment);
    const changedAssessment =
        contractable.firstContract.id === currentAssessment.contract.id
            ? undefined
            : currentAssessment;
    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('Sheet');
    const worksheet = workbook.getWorksheet('Sheet');
    setWidth(worksheet);
    buildCoverRows(worksheet, previousAssessment, changedAssessment);
    const previousPartSummaries =
        getPartSummariesFromAssessment(previousAssessment);
    const changedPartSummaries =
        changedAssessment && getPartSummariesFromAssessment(changedAssessment);
    const detailRowIndex = buildSummaryRows(
        worksheet,
        previousAssessment,
        previousPartSummaries,
        changedAssessment,
        changedPartSummaries,
    );
    buildDetailRows(
        worksheet,
        detailRowIndex,
        previousAssessment,
        previousPartSummaries,
        changedAssessment,
        changedPartSummaries,
    );
    await downloadWorkbook(workbook, contractable);
};

function setWidth(sheet: Worksheet) {
    sheet.getColumn('A').width = 3;
    sheet.getColumn('B').width = 30;
    ['C', 'D', 'E', 'F', 'G', 'H'].forEach(col => {
        sheet.getColumn(col).width = 20;
    });
}

async function getPreviousAssessment(
    currentAssessment: Assessment,
): Promise<Assessment> {
    const currentContractIndex =
        currentAssessment.contractable.contracts.findIndex(
            c => c.id === currentAssessment.contract.id,
        );
    if (
        !currentContractIndex ||
        !currentAssessment.contractable.contracts[currentContractIndex - 1]
    ) {
        throw new Error('一つ前の契約が存在しません');
    }
    const previousContract =
        currentAssessment.contractable.contracts[currentContractIndex - 1];
    const assessmentStatements =
        await AssessmentStatementRepository.findByContract(previousContract.id);
    return buildAssessment(
        assessmentStatements,
        currentAssessment.contractable,
        previousContract,
    );
}

async function downloadWorkbook(
    workbook: Workbook,
    contractable: Design | Construction,
) {
    const uint8Array = await workbook.xlsx.writeBuffer();
    const blob = new Blob([uint8Array], {
        type: 'application/octet-binary',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `査定表${contractable.documentNumber?.value || ''}${
        contractable.name
    }.xlsx`;
    a.click();
    a.remove();
}
