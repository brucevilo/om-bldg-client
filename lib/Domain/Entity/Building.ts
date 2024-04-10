import { AttachmentInfo } from '../ValueObject';

export class Building {
    constructor(
        public id: number,
        public line: string,
        public stationNumber: string,
        public buildingType: string,
        public facilityName: string,
        public location: string,
        public constructionDate: Date | null,
        public structure: string | null,
        public landArea: number | null,
        public totalArea: number | null,
        public buildingArea: number | null,
        public createdAt: Date | null,
        public updatedAt: Date | null,
        public drawingInfo?: AttachmentInfo,
    ) {}
}
