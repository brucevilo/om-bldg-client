import { valueIsMatchType } from '@/App/Migrations/apps/utils';
import XLSX from 'xlsx';
import { Excel } from '@/Infrastructure';
import { ProjectRepository } from '@/Domain/Repository';
import { WbsRow } from '@/Domain/Factory';

export class WBSSheetService {
    static async upload(
        WBSSheet: File,
        note: string,
        listOfTargetYear: number[],
    ): Promise<void> {
        const wbs: WbsRow[] = [];
        const wbsRow: WbsRow = {
            no: 0,
            large_investment: '',
            medium_investment: '',
            small_investment: '',
            government_report: '',
            wbs_level1: '',
            name: '',
            classification: '',
            budget_purpose: '',
            segment_code: '',
            segment_name: '',
            line_code: '',
            line_name: '',
            station_code: '',
            station_name: '',
            construction_section_code: '',
            construction_section_name: '',
            accounting_code: '',
            accounting_name: '',
            asset_class_code: '',
            asset_class_name: '',
            april: 0,
            may: 0,
            june: 0,
            july: 0,
            august: 0,
            september: 0,
            october: 0,
            november: 0,
            december: 0,
            january: 0,
            february: 0,
            march: 0,
            target_year: 0,
            budget_division: 0,
            annual_total: 0,
            first_year: 0,
            second_year: 0,
            third_year: 0,
            fourth_year: 0,
            midterm_total: 0,
            wbs_level2: '',
            input_level2: '',
            spare_item1: '',
            spare_item2: '',
            spare_item3: '',
        };

        const stringColumns = [
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H',
            'I',
            'K',
            'M',
            'O',
            'Q',
            'R',
            'S',
            'T',
            'U',
            'AN',
            'AO',
            'AP',
            'AP',
            'AQ',
            'AR',
        ];
        const nullableColumns = ['T', 'AO', 'AP', 'AQ', 'AR'];
        const numberColumns = [
            'A',
            'V',
            'W',
            'X',
            'Y',
            'Z',
            'AA',
            'AB',
            'AC',
            'AD',
            'AE',
            'AF',
            'AG',
            'AH',
            'AI',
            'AJ',
            'AK',
            'AL',
            'AM',
        ];
        let rowData: WbsRow = { ...wbsRow };
        let itemCol = '';

        // reading the file
        const book = await Excel.read(WBSSheet);

        // reading sheet
        const coverSheet = book.Sheets['WBS管理シート'];

        // set starting index
        const firstIndex = 7;

        const getColIndex = (coverSheet: XLSX.Sheet): number => {
            const result = [];

            let row;
            let rowNum;
            let colNum;

            const range = coverSheet['!ref']
                ? XLSX.utils.decode_range(coverSheet['!ref'])
                : { e: { c: 0, r: 0 }, s: { c: 0, r: 0 } };

            for (rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
                row = [];
                for (colNum = range.s.c; colNum <= range.e.c; colNum++) {
                    const nextCell =
                        coverSheet[
                            XLSX.utils.encode_cell({ r: rowNum, c: colNum })
                        ];
                    if (typeof nextCell !== 'undefined' || nextCell) {
                        row.push(nextCell.w);
                    }
                }
                if (
                    row.length >=
                    stringColumns.length + numberColumns.length - 6
                ) {
                    result.push(row);
                }
            }
            result.shift();
            return result.filter(item => item.length).length + firstIndex;
        };
        const alreadyUploaded = listOfTargetYear.some(
            item => item == coverSheet['B2']?.v,
        );

        const lastIndex = getColIndex(coverSheet);
        if (alreadyUploaded) {
            throw new Error(
                `${
                    coverSheet['B2'].v as string
                }年度のWBSは、既にアップロードされています`,
            );
        } else if (
            coverSheet['A1']?.v !== 'WBS管理シート' ||
            coverSheet['A2']?.v !== '対象年度' ||
            coverSheet['A3']?.v !== '予算課' ||
            coverSheet['A5']?.v !== 'No' ||
            coverSheet['B6']?.v !== '大項目' ||
            coverSheet['B5']?.v !== '投資区分' ||
            coverSheet['C6']?.v !== '中項目' ||
            coverSheet['D6']?.v !== '小項目' ||
            coverSheet['E6']?.v !== '国交省報告' ||
            coverSheet['F6']?.v !== 'WBSLv1' ||
            coverSheet['G6']?.v !== '名称' ||
            coverSheet['H6']?.v !== '名称' ||
            coverSheet['H5']?.v !== '財務分類' ||
            coverSheet['I5']?.v !== '工事名称等' ||
            coverSheet['J5']?.v !== 'セグメント' ||
            coverSheet['L5']?.v !== '号線' ||
            coverSheet['N5']?.v !== '駅' ||
            coverSheet['P5']?.v !== '施工課' ||
            coverSheet['R5']?.v !== '勘定コード' ||
            coverSheet['T5']?.v !== '資産クラス'
        ) {
            throw new Error('ファイルフォーマットが無効です');
        } else {
            let hasFileError = false;
            for (let i = firstIndex; i < lastIndex; i++) {
                const hasStringValue = stringColumns.every(item => {
                    if (nullableColumns.includes(item)) {
                        return true;
                    }
                    if (
                        !valueIsMatchType(
                            'string',
                            coverSheet[`${item}${i}`]?.v,
                        )
                    ) {
                        hasFileError = true;
                        itemCol = item;
                        return false;
                    }
                    return true;
                });

                const hasNumberValue = numberColumns.every(item => {
                    if (
                        !valueIsMatchType(
                            'number',
                            coverSheet[`${item}${i}`]?.v,
                        )
                    ) {
                        itemCol = item;
                        hasFileError = true;
                        return false;
                    }
                    return true;
                });
                if (!hasStringValue || !hasNumberValue) {
                    throw new Error(
                        `カラム： ${itemCol} 行: ${i} の値が不正です`,
                    );
                }
                rowData.target_year = coverSheet['B2'].v;
                rowData.budget_division = coverSheet['B3'].v;
                rowData.no = coverSheet[`A${i}`].v;
                rowData.large_investment = coverSheet[`B${i}`].v;
                rowData.medium_investment = coverSheet[`C${i}`].v;
                rowData.small_investment = coverSheet[`D${i}`].v;
                rowData.government_report = coverSheet[`E${i}`].v;
                rowData.wbs_level1 = coverSheet[`F${i}`].v;
                rowData.name = coverSheet[`G${i}`].v;
                rowData.classification = coverSheet[`H${i}`].v;
                rowData.budget_purpose = coverSheet[`I${i}`].v;
                rowData.segment_code = coverSheet[`J${i}`].v;
                rowData.segment_name = coverSheet[`K${i}`].v;
                rowData.line_code = coverSheet[`L${i}`].v;
                rowData.line_name = coverSheet[`M${i}`].v;
                rowData.station_code = coverSheet[`N${i}`].v;
                rowData.station_name = coverSheet[`O${i}`].v;
                rowData.construction_section_code = coverSheet[`P${i}`].v;
                rowData.construction_section_name = coverSheet[`Q${i}`].v;
                rowData.accounting_code = coverSheet[`R${i}`].v;
                rowData.accounting_name = coverSheet[`S${i}`].v;
                rowData.asset_class_code = coverSheet[`T${i}`]?.v || '';
                rowData.asset_class_name = coverSheet[`U${i}`]?.v || '';
                rowData.april = coverSheet[`V${i}`].v;
                rowData.may = coverSheet[`W${i}`].v;
                rowData.june = coverSheet[`X${i}`].v;
                rowData.july = coverSheet[`Y${i}`].v;
                rowData.august = coverSheet[`Z${i}`].v;
                rowData.september = coverSheet[`AA${i}`]?.v || 0;
                rowData.october = coverSheet[`AB${i}`].v;
                rowData.november = coverSheet[`AC${i}`].v;
                rowData.december = coverSheet[`AD${i}`].v;
                rowData.january = coverSheet[`AE${i}`].v;
                rowData.february = coverSheet[`AF${i}`].v;
                rowData.march = coverSheet[`AG${i}`].v;
                rowData.annual_total = coverSheet[`AH${i}`].v;
                rowData.first_year = coverSheet[`AI${i}`].v;
                rowData.second_year = coverSheet[`AJ${i}`].v;
                rowData.third_year = coverSheet[`AK${i}`].v;
                rowData.fourth_year = coverSheet[`AL${i}`].v;
                rowData.midterm_total = coverSheet[`AM${i}`].v;
                rowData.wbs_level2 = coverSheet[`AN${i}`].v;
                rowData.input_level2 = coverSheet[`AO${i}`]?.v || '';
                rowData.spare_item1 = coverSheet[`AP${i}`]?.v || '';
                rowData.spare_item2 = coverSheet[`AQ${i}`]?.v || '';
                rowData.spare_item3 = coverSheet[`AR${i}`]?.v || '';
                wbs.push(rowData);
                rowData = { ...wbsRow };
            }
            if (!hasFileError) {
                await ProjectRepository.createWBS(wbs, WBSSheet, note).catch(
                    () => {
                        throw new Error(
                            'WBS登録に失敗しました、後ほど再度お試しください',
                        );
                    },
                );
            }
        }
    }
}
