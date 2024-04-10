import { Construction } from '@/Domain/Entity';
// TODO: check this again
export class ProjectByYearWithWBS {
    constructor(
        public id: number,
        public targetYear: number,
        public wbsLevel1: string,
        public name: string,
        public createdAt: Date,
        public updatedAt: Date,
        public wbs?: WbsByYear | null,
        public constructions?: Construction[] | null,
        public initialBudget?: WbsByYear | null,
        public actualBudget?: WbsByYear | null,
        public owner?: string | null,
        public prevCsHistory?: number,
        public latestCsHistory?: number,
        public reasonForChange?: string | null,
    ) {}
}
export class WbsByYear {
    constructor(
        public april: number,
        public may: number,
        public june: number,
        public july: number,
        public august: number,
        public september: number,
        public october: number,
        public november: number,
        public december: number,
        public january: number,
        public february: number,
        public march: number,
        public firstYear: number,
        public secondYear: number,
        public thirdYear: number,
        public fourthYear: number,
    ) {}
}
