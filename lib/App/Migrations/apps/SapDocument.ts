import { Excel, utils } from '@/Infrastructure';
import { convertToAscii, splitAssetText } from './utils';

export type SapRecord = {
    assetKey: string;
    assetId: string;
    assetSubId: string;
    assetName: string;
    assetText: string;
    assetClassCode: string;
    acquisitionDate: Date;
    acquisirionPrice: number;
    constructionYear: number;
    constructionName: string;
};

export type SapRecordMap = {
    [assetKey: string]: SapRecord;
};

export async function readSapDocument(
    sapDocument: File,
): Promise<SapRecordMap> {
    const book = await Excel.read(sapDocument);
    const sheetName = book.SheetNames.find(v =>
        /^(固定資産台帳|建築資産管理システム移行データ).*/.test(v),
    );
    if (sheetName === undefined) {
        throw new Error(
            '固定資産台帳で始まる名前のシートが見つかりませんでした。',
        );
    }
    const sheet = book.Sheets[sheetName];
    const _range = sheet['!ref'];
    if (_range === undefined) {
        throw new Error(
            `${sheetName}から情報を取得することが出来ませんでした。`,
        );
    }
    const range = utils.decode_range(_range);
    const records: SapRecordMap = {};
    const headers: {
        [key: string]: number;
    } = {};
    for (let i = 0, n = range.e.c; i <= n; i++) {
        headers[sheet[utils.encode_cell({ c: i, r: 0 })].v] = i;
    }
    for (let i = 1, n = range.e.r; i <= n; i++) {
        const createdAt =
            sheet[utils.encode_cell({ c: headers['取得日付'], r: i })].v;
        // 民営化前の資産は除外
        if (createdAt <= new Date('2018/3/31')) {
            continue;
        }
        const assetText =
            sheet[utils.encode_cell({ c: headers['資産テキスト'], r: i })]?.v;
        const assetId =
            sheet[utils.encode_cell({ c: headers['資産ID'], r: i })]?.v;
        const assetSubId =
            sheet[utils.encode_cell({ c: headers['資産補助番号'], r: i })]?.v;
        const assetKey = `${assetId}-${assetSubId.padStart(4, '0')}`;
        const splitedAssetText = splitAssetText(
            convertToAscii(assetText).trim(),
        );
        const sapRecord: SapRecord = {
            assetKey: assetKey,
            assetId: assetId,
            assetSubId: assetSubId,
            assetName:
                sheet[utils.encode_cell({ c: headers['資産名称'], r: i })]?.v,
            assetText: assetText,
            assetClassCode:
                sheet[utils.encode_cell({ c: headers['資産クラス'], r: i })]?.v,
            acquisitionDate: createdAt,
            acquisirionPrice:
                sheet[utils.encode_cell({ c: headers['取得価額(期末)'], r: i })]
                    ?.v,
            constructionYear: splitedAssetText.year,
            constructionName: splitedAssetText.text,
        };
        records[assetKey] = sapRecord;
    }
    return records;
}
