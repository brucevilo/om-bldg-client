export function assertsIsExists<T>(
    val: T,
    message = '値が存在しません',
): asserts val is NonNullable<T> {
    if (val === undefined) {
        console.error(val);
        throw new Error(message);
    }
}

export function assertsIsNotNull<T>(
    val: T,
    message = '値がNullです',
): asserts val is NonNullable<T> {
    if (val === null) {
        console.error(val);
        throw new Error(message);
    }
}

export function assertsIsNotNegative(
    val: number,
    message = 'マイナスの値は入力できません',
): asserts val is NonNullable<number> {
    if (val < 0) {
        console.error(val);
        throw new Error(message);
    }
}

export function assertsIsNotNumeric(
    val: number,
    message = '数値以外の値は入力できません',
): asserts val is NonNullable<number> {
    if (isNaN(Number(val))) {
        console.error(val);
        throw new Error(message);
    }
}
