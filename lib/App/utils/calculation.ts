export function roundingInt(num: number, digit: number): number {
    const truncateNum = 10 ** digit;
    return Math.round(num / truncateNum) * truncateNum;
}

// エクセルの小数点の取り扱いに合わせる
export function excelRoundingPoint(num: number): number {
    const truncateNum = 10 ** 9;
    return Math.round(num * truncateNum) / truncateNum;
}

export function floorOfPoint(num: number, digit: number): number {
    const truncateNum = 10 ** digit;
    return Math.floor(num * truncateNum) / truncateNum;
}
