export class AssessmentStatement {
    constructor(
        public id: number | null,
        public part: string,
        public name: string,
        public size: string,
        public amount: number,
        public unit: string,
        public costDocumentPrice: number,
        public price: number | null,
        public isOpen: boolean,
        public constructionTypeSerialNumber?: number,
    ) {}
}
