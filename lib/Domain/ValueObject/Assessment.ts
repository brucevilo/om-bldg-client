import {
    Contract,
    AssessmentStatement,
    Contractable,
    AssetStatement,
} from '../Entity';

export type AssessmentOutputType = '業務委託用' | '設計業務委託用' | '工事用';

export class Assessment {
    constructor(
        public contractable: Contractable,
        public contract: Contract,
        public outputType: AssessmentOutputType,
        public statements: AssessmentStatement[],
        public addedAssessmentPriceAssetStatements?: AssetStatement[],
    ) {}
}
