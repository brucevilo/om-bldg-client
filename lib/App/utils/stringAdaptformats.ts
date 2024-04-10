// 全角右カッコを半角右カッコに変換、文字で直接指定しようとすると検証環境で動作しなくなるので文字コードで判断
export function fullWidthRightCircleBracketsToHalfSize(char: string): string {
    if (char.charCodeAt(0) !== 65289) {
        return char;
    }
    return String.fromCharCode(41);
}

export function fullAlphabetAndNumberToHalf(char: string): string {
    if (char.match(/[Ａ-Ｚａ-ｚ０-９]/)) {
        return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    }
    return char;
}

export function stringAdaptFormats(
    str: string,
    ...formats: ((char: string) => string)[]
): string {
    const l = str.split('');
    return l
        .map(c => {
            return formats.reduce((_c, format) => format(_c), c);
        })
        .join('');
}
