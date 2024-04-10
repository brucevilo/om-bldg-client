export function convertToAscii(s: string): string {
    return s
        .replace(/[Ａ-Ｚａ-ｚ０-９－（）]/g, function (s) {
            return String.fromCharCode(s.charCodeAt(0) - 65248);
        })
        .replace('　', ' ')
        .replace('：', ':');
}

type SplitedAssetText = {
    year: number;
    text: string;
};
export function splitAssetText(s: string): SplitedAssetText {
    let match = s.match(/^(20[012][0-9])(_|年度|年)?(.+)/);
    if (match) {
        return {
            year: Number(match[1].trim()),
            text: match[3].trim(),
        };
    }
    match = s.match(/^(平成|H)([0-9]{2})(_|年度|年)?(.+)/);
    if (match) {
        return {
            year: Number(match[2].trim()) - 12 + 2000,
            text: match[4].trim(),
        };
    }
    return {
        year: 0,
        text: s,
    };
}

export const JSON = {
    stringify: global.JSON.stringify,
    parse: <T = unknown>(text: string): T =>
        global.JSON.parse(text, (_key, value) => {
            return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.test(value)
                ? new Date(value)
                : value;
        }) as T,
};

export async function readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const data = reader.result as string;
            resolve(data.split(',')[1]);
        };
        reader.onerror = () => {
            reject();
        };
        reader.readAsDataURL(file);
    });
}

export function bytesToMb(size: number): number {
    return Math.round((size * 100) / (1024 * 1024)) / 100;
}

export function extractFileExtention(fileName: string): string {
    const toArray = fileName.split('.');
    const extension = toArray.pop() || '';
    return extension;
}

export function valueIsMatchType(type: string, val: string): boolean {
    return typeof val === type;
}

export function uploadAlert(col: string, row: number): void {
    return alert(`カラム： ${col} 行: ${row} の値が不正です`);
}

export function generateFiscalYear(year: number): string[] {
    return [
        [year, 4],
        [year, 5],
        [year, 6],
        [year, 7],
        [year, 8],
        [year, 9],
        [year, 10],
        [year, 11],
        [year, 12],
        [year + 1, 1],
        [year + 1, 2],
        [year + 1, 3],
    ].map(([y, m]) => `${y}年${m}月`);
}
