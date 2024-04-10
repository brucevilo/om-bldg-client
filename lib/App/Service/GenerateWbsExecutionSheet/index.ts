import { ProjectByYearWithWBSAndCS } from '@/Domain/Entity/ProjectWbsByYearAndCS';
import ExcelJS from 'exceljs';
import { DateTime } from 'luxon';
import buildBody from './buildBody';
import buildFirstRow from './buildFirstRow';
import buildHeaders from './buildHeaders';
import setColumnsWdith from './setColumnsWidth';
import { Supplier } from '@/Domain/Entity';

export const generateWbsExecutionSheet = async (
    projectsByYearWithCS: ProjectByYearWithWBSAndCS[],
    masterContext: Supplier[],
): Promise<void> => {
    const wbsColumns = `A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,
    AA,AB,AC,AD,AE,AF,AG,AH,AI,AJ,AK,AL,AM,AN,AO,AP,AQ,AR,AS,AT,AU,AV,AW`.split(
        ',',
    );

    const workbook = new ExcelJS.Workbook();
    workbook.addWorksheet('執行管理表（各部追記作業シート）★');
    const worksheet =
        workbook.getWorksheet('執行管理表（各部追記作業シート）★');

    setColumnsWdith(worksheet);

    buildFirstRow(worksheet);
    buildHeaders(
        worksheet,
        Number(projectsByYearWithCS[0]?.targetYear),
        wbsColumns,
    );
    buildBody(worksheet, projectsByYearWithCS, masterContext);

    const uint8Array = await workbook.xlsx.writeBuffer();
    const blob = new Blob([uint8Array], {
        type: 'application/octet-binary',
    });

    const url = window.URL.createObjectURL(blob);
    const htmlElementA = document.createElement('a');
    htmlElementA.href = url;
    htmlElementA.download = `建築課執行管理表${DateTime.fromJSDate(
        new Date(),
    ).toFormat('yyyyMMdd')}.xlsx`;
    htmlElementA.click();
    htmlElementA.remove();
};
