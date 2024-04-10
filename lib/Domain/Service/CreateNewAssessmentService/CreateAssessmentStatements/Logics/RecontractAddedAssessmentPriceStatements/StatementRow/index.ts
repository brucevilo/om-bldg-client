import { assertsIsNotNull } from '@/Infrastructure';

export class AssessmentStatementRow {
    public f: number; // 前回契約金額
    public m: number; // 差引増減金額
    public s: number; // 差引増減金額①　mと同じだが変更査定表に従い作る
    public o: number | null = null; // 査定金額
    public p: number | null = null; // 千丸め
    public q: number | null = null; // 万丸め
    public v: number | null = null; // ① -（②×③）
    public t: number | null = null; // 査定率②
    public r: 0 | 1 | null = null; // s294の計算で使うフラグ, 本来は0か空白(null)だが、、未計算の時にエラーにしたいため、0か1にする
    public w: number | null = null; // 査定金額A（四捨五入）
    public u: number | null = null; // ランク(T列大きい順)
    public y: 0 | 1 | null = null; // 調査対象①, 本来は1 or 空白だが SUMで換算する必要があるので0にする
    public z: 0 | 1 | null = null; // 調査対象②, 本来は1 or 空白だが SUMで換算する必要があるので0にする
    public x: number | null = null; // 査定金額B（端数調整）
    public h: number | null = null; // 差引金額
    public g: number | null = null; // 今回設計変更金額

    constructor(
        public currentEstimatePrice: number, // 今回の内訳書の明細金額
        public beforeContractContractPrice: number, // 前回の契約金額
        public name: string,
        public part?: string,
        public constructionStatementId?: number,
    ) {
        this.f = beforeContractContractPrice;
        this.m = currentEstimatePrice - beforeContractContractPrice;
        this.s = this.m;
    }

    get getContractedPrice(): number {
        assertsIsNotNull(this.g, 'g列が入力されていません');
        return this.g;
    }
}
