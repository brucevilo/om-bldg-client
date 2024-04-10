// 運用している科目複数シートによっては行数のずれあり
export class KamokufukusuuSheet {
    public q66: number | null = null;
    public t66: number | null = null; // 査定対象金額(M298と同じ)
    public m298: number | null = null; // M294 - H294
    public m294: number | null = null; // 予定価格の差し引き金額の差額(税抜)
    public m291: number | null = null; // 予定価格の差し引き金額の差額(税込)
    public h294: number | null = null; // 契約金額差額(税抜)
    public h291: number | null = null; // 契約金額差額(税込)
    public u297: number | null = null; // 差額対象順位(按分金額が+か-か)
    public w297: number | null = null; // 端数調整金額(差引き合計(抜) - 査定金額A合計（四捨五入）(抜))
    // public w294: number | null = null; // 査定金額A合計（W列合計
    public u299: 'S' | 'O' | null = null; // S || O
    public s294: number | null = null; // 差引増減金額①, 増額のみ合計（税抜）
    public u298: number | null = null; // 対象項目数
}
