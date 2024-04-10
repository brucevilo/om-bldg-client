import { CostDocument } from '@/Domain/ValueObject';
import {
    fullWidthRightCircleBracketsToHalfSize,
    stringAdaptFormats,
} from '@/App/utils/stringAdaptformats';

type allKoujimeiSameCheckResult = {
    result: boolean;
    errorKoujiSheetKoujimei: string;
};

export class CostDocumentFormatChecker {
    constructor(private costDocument: CostDocument) {}

    // 表紙に費目：松屋町駅の部、工事名：A乗降階段内壁パネル化工事、B乗降階段内壁パネル化工事、C乗降階段内壁パネル化工事、が記載された場合に
    // 工事名に記載された各工事明細シートのC2のセルに「松屋町駅の部-A乗降階段内壁パネル化工事」、などのpart(費目)と工事名をハイフンで繋いだ文字列が表紙の全工事分存在しているかチェックする
    public allKoujimeiSameCheck(): allKoujimeiSameCheckResult {
        const koujiHimokuAndKoujiMeisaimeiStrings =
            this.connectKoujiHimokuAndKoujiMeisaimeiWithHyphen();
        const checkResults = this.costDocument.constructionSheets.map(sheet => {
            const koujiSheetKoujimei = sheet['C2'].v;
            return this.hyousiKoujimeiAndKoujiSheetKoujiMeisaimeiCheck(
                koujiSheetKoujimei,
                koujiHimokuAndKoujiMeisaimeiStrings,
            );
        });
        const errorResults = checkResults.filter(
            resultObj => resultObj.result === false,
        );
        return {
            result: checkResults.every(resultObj => resultObj.result),
            errorKoujiSheetKoujimei: errorResults.length
                ? errorResults[0].errorKoujiSheetKoujimei
                : '',
        };
    }

    private hyousiKoujimeiAndKoujiSheetKoujiMeisaimeiCheck(
        koujiSheetKoujimei: string,
        koujiHimokuAndKoujiMeisaimeiStrings: string[],
    ): allKoujimeiSameCheckResult {
        // エラー1: 工事内訳書登録時の名称一致エラーチェック;
        const formattedKoujiSheetKoujimei = stringAdaptFormats(
            koujiSheetKoujimei,
            fullWidthRightCircleBracketsToHalfSize,
        );
        const result = koujiHimokuAndKoujiMeisaimeiStrings.includes(
            formattedKoujiSheetKoujimei,
        );
        const errorKoujimei = result ? '' : koujiSheetKoujimei;
        return { result: result, errorKoujiSheetKoujimei: errorKoujimei };
    }

    private connectKoujiHimokuAndKoujiMeisaimeiWithHyphen() {
        const hyousi = this.costDocument.coverSheet;
        const eofRowIndex = this.costDocument.eofRowIndex;
        let rowIndex = this.costDocument.firstRowIndex;
        const result: string[] = [];
        let himoku = '';
        while (true) {
            if (rowIndex > eofRowIndex - 2) {
                break;
            }
            const meishouColumn = hyousi[`D${rowIndex}`];
            const key = `${this.costDocument.keyLine}${rowIndex}`;
            if (hyousi[`${key}`] && this.costDocument.isPartRow(key)) {
                himoku = meishouColumn.v;
            }
            if (
                hyousi[`${key}`] &&
                this.costDocument.isConstructionStatementChangedRow(key)
            ) {
                result.push(`${himoku}-${meishouColumn.v}`);
            }
            rowIndex++;
        }
        return result;
    }
}
