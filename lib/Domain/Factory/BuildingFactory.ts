import { Building } from '../Entity';
import { AttachmentInfo } from '../ValueObject';

export interface BuildingResponse {
    id: number;
    line: string;
    station_number: string;
    building_type: string;
    facility_name: string;
    location: string;
    construction_date: Date | null;
    structure: string | null;
    land_area: number | null;
    total_area: number | null;
    building_area: number | null;
    created_at: Date;
    updated_at: Date;
    drawing_info: AttachmentInfo;
}

export class BuildingFactory {
    static createFromResponse(res: BuildingResponse): Building {
        const constructionDate = res.construction_date
            ? new Date(res.construction_date)
            : res.construction_date;

        return new Building(
            res.id,
            res.line,
            res.station_number,
            res.building_type,
            res.facility_name,
            res.location,
            constructionDate,
            res.structure,
            res.land_area,
            res.total_area,
            res.building_area,
            new Date(res.created_at),
            new Date(res.updated_at),
            res.drawing_info,
        );
    }
}
