import { ProjectConstruction } from '@/Domain/Entity';

export interface ProjectConstructionResponse {
    id: number;
    project_id: number;
    construction_id: number;
    created_at: string;
    updated_at: string;
}

export class ProjectConstructionFactory {
    static createFromResponse(
        res: ProjectConstructionResponse,
    ): ProjectConstruction {
        return new ProjectConstruction(
            res.id,
            res.project_id,
            res.construction_id,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
