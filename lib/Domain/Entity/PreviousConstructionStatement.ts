import { assertsIsExists } from '@/Infrastructure';
import { Entity, Timestamps, Classification } from '.';

export class PreviousConstructionStatement implements Entity, Timestamps {
    constructor(
        public id: number | null,
        public contractId: number,
        public name: string,
        public projectCode: string,
        public term: Date,
        public classification: Classification,
        public isRetiremented: boolean,
        public isConstructionInProgressCompleted: boolean,
        public scheduledAcceptanceDate: Date | null,
        public isCollateral: boolean,
        public createdAt: Date,
        public updatedAt: Date,
    ) {
        const _ = this.name.split(/-/);
        assertsIsExists(
            _[0],
            'ConstructionStatement名がpart名-工事名称ではありません',
        );
        assertsIsExists(
            _[1],
            'ConstructionStatement名がpart名-工事名称ではありません',
        );
        this.assessmentPart = _[0];
        this.assessmentName = _.splice(1).join('-');
    }
    public assessmentPart: string;
    public assessmentName: string;

    public get isAssetClassification(): boolean {
        return this.classification === Classification.Asset;
    }
}
