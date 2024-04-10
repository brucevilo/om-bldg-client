import { WorkBook } from 'xlsx';

export type UpdateMigratedContractParams = {
    approval_number: number | null;
    document_number: string | null;
    design_chief_name: string | null;
    design_staff_name: string | null;
    construction_chief_name: string | null;
    construction_staff_name: string | null;
    supplier_name: string | null;
    expected_price: number | null;
    expected_price_with_tax: number | null;
    contracted_price: number | null;
    rate: number | null;
    contract_at: Date | null;
};

// 査定表から更新する値の参考資料 https://rit-inc.slack.com/archives/C0107UYD45T/p1662425405339949?thread_ts=1661935382.542579&cid=C0107UYD45T
// 参考資料エクセルに記載のある値とA-shaシステム側のカラム名
// 稟議番号：approval_number
// 設計書番号：document_number
// 設計担当係長：design_chief_id
// 設計担当者：design_staff_id
// 工事担当係長：construction_chief_id
// 工事担当者：construction_staff_id
// 受注者名：supplier_id
// 当初予定価格(税抜)：expected_price
// 当初予定価格(税込み)：expected_price_with_tax
// 当初契約金額(税抜)：contracted_price
// 落札率：多分テーブルには保存されておらず、contract.rate()にてthis.contractedPrice / this.expectedPriceWithTaxで計算しており、ContractRateというクラスも存在している
// 契約日：contract_at

// 人物のIDについてはユーザーデータの名前と一致させたIDを保存する。よってフロントのparamsは名前を送信し、サーバー側で該当の人物が保存されたか確認する
// 参考：https://rit-inc.slack.com/archives/CUPHNJTHQ/p1662452310469959?thread_ts=1662021470.438859&cid=CUPHNJTHQ

function checkCoverSheetFormatIsValid(workBook: WorkBook): boolean {
    const isBookHasNyuuryokuHyouSheet = workBook.SheetNames.some(
        sheetName => sheetName === '入力表',
    );
    if (!isBookHasNyuuryokuHyouSheet) {
        throw new Error(
            'アップロードされた査定表に「入力表」という名前のシートがありません。査定表以外のエクセルファイルは保存されないため、ファイル形式をご確認の上もう一度アップロードしてください。',
        );
    }
    return isBookHasNyuuryokuHyouSheet;
}

export class GenerateUpdateContractParamsFromAssessmentFileService {
    static generateFromAssessmentFile(
        assessmentFile: WorkBook,
    ): UpdateMigratedContractParams | null {
        const isValid = checkCoverSheetFormatIsValid(assessmentFile);
        if (!isValid) return null;

        const sheet = assessmentFile.Sheets['入力表'];
        const RingiBango = sheet['J7']?.v;
        const SekkeiShoBango = sheet['B5']?.v;
        const SekkeiTantouKakarichoName = sheet['F3']?.v;
        const SekkeiTantouShaName = sheet['H3']?.v;
        const KoujiTantouKakarichoName = sheet['F4']?.v;
        const KoujiTantouShaName = sheet['H4']?.v;
        const JuchuuShaName = sheet['B10']?.v;
        const ToushoYoteiKakakuZeinuki = sheet['K1']?.v;
        const ToushoYoteiKakakuZeikomi = sheet['K3']?.v;
        const ToushoKeiyakuKingakuZeikomi = sheet['M3']?.v;
        const RakusatuRitu = sheet['B15']?.v;
        const Keiyakubi = sheet['B4']?.v;

        const params: UpdateMigratedContractParams = {
            approval_number: RingiBango || null,
            document_number: SekkeiShoBango || null,
            design_chief_name: SekkeiTantouKakarichoName || null,
            design_staff_name: SekkeiTantouShaName || null,
            construction_chief_name: KoujiTantouKakarichoName || null,
            construction_staff_name: KoujiTantouShaName || null,
            supplier_name: JuchuuShaName || null,
            expected_price: ToushoYoteiKakakuZeinuki || null,
            expected_price_with_tax: ToushoYoteiKakakuZeikomi || null,
            contracted_price: ToushoKeiyakuKingakuZeikomi || null,
            rate: RakusatuRitu || null,
            contract_at: new Date(Keiyakubi) || null,
        };
        return params;
    }
}
