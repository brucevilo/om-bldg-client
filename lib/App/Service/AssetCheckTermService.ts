import { DateTime, Interval } from 'luxon';

export class AssetCheckTermService {
    public static getCheckTerm(): Interval {
        return this.firstHalfCheckedTerm().contains(DateTime.local())
            ? this.firstHalfCheckedTerm()
            : this.secondHalfCheckedTerm();
    }

    private static firstHalfCheckedTerm() {
        const currentYear = new Date().getFullYear();
        const checkStartAt = DateTime.local(currentYear, 4, 1);
        const checkEndAt = DateTime.local(currentYear, 9, 30);
        return Interval.fromDateTimes(checkStartAt, checkEndAt);
    }

    private static secondHalfCheckedTerm() {
        const currentYear = new Date().getFullYear();
        const checkStartAt = DateTime.local(currentYear, 10, 1);
        const checkEndAt = DateTime.local(currentYear + 1, 3, 31);
        return Interval.fromDateTimes(checkStartAt, checkEndAt);
    }
}
