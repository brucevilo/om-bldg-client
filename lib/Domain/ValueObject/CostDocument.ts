import { Sheet, WorkBook } from 'xlsx/types';

export class CostDocument {
    private cover: Sheet;
    constructor(private book: WorkBook) {
        this.cover = book.Sheets['表紙'];
    }

    // 当初設計は（I列）
    // 設計変更は（K列）
    get totalPrice(): number {
        if (this.isFirstContract) {
            return Number(this.cell(`I${this.eofRowIndex - 1}`));
        }
        return Number(this.cell(`K${this.eofRowIndex - 1}`));
    }

    get firstRowIndex(): number {
        return 28;
    }

    /**
     * 表紙のM列を上から順に走査してEOFの記述があるセルの行番号をセットする
     */
    get eofRowIndex(): number {
        for (let i = 1; i < 1000; i++) {
            if (this.cell(`${this.eofCol}${i}`) === 'EOL') {
                return i;
            }
        }
        throw new Error(`${this.eofCol}列にEOLが存在しません`);
    }

    get eofCol(): string {
        return this.isFirstContract ? 'M' : 'P';
    }

    get keyLine(): string {
        return this.isFirstContract ? 'L' : 'O';
    }

    get priceLine(): string {
        return this.isFirstContract ? 'I' : 'K';
    }

    get memoLine(): string {
        return this.isFirstContract ? 'J' : 'M';
    }

    get constructionSheets(): Sheet[] {
        return this.constructionSheetNames.map(n => this.book.Sheets[n]);
    }

    get constructionSheetNames(): string[] {
        return this.book.SheetNames.filter(n => /^工事[0-9]+$/.test(n));
    }

    get coverSheet(): Sheet {
        return this.cover;
    }

    cell<T>(key: string): T | null {
        if (!this.cover) {
            throw new Error(
                '工事費内訳書以外のファイルをアップロードしています',
            );
        }
        return this.cover[key] ? this.cover[key].v : null;
    }

    isPartRow(key: string): boolean {
        return this.cell<string | null>(key) === '費目';
    }

    isDesignStatementRow(key: string): boolean {
        return /.*業.*務.*/.test(this.cell<string | null>(key) || '');
    }

    isConstructionStatementChangedRow(key: string): boolean {
        return /.*工.*事[1-9]+/.test(this.cell<string | null>(key) || '');
    }

    isConstructionStatementRow(key: string): boolean {
        return /.*工.*事.*/.test(this.cell<string | null>(key) || '');
    }

    /**
     * 初回の内訳書はJ27が摘要
     * 二回目以降は内訳書の項目が増えているので摘要がM27になる
     * 設計の明細はフォーマット同一なので関係なし
     */
    get isFirstContract(): boolean {
        const 摘要regexp = /.*摘.*要.*/;
        if (摘要regexp.test(this.cell('J27') || '')) return true;
        if (摘要regexp.test(this.cell('M27') || '')) return false;
        throw new Error(
            'J27もしくはM27に"摘要"が存在しないため内訳書が初回契約か二回目以降の契約かの判別ができません',
        );
    }
}
