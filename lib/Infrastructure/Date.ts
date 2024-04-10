import { DateTime } from 'luxon';

// 2022-04-20T12:09:56.384+09:00 の形式でタイムゾーンが日本時間になったISOStringが返る
export const dateToIsoString = (date: Date): string => {
    const isoString = DateTime.fromJSDate(date).toISO();
    return isoString;
};

// 2022-04-20 の形式でタイムゾーンが日本時間になったStringが返る
export const dateToIsoDateString = (date: Date): string => {
    const isoString = DateTime.fromJSDate(date).toISODate();
    return isoString;
};
