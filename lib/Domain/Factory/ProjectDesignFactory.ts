import { ProjectDesign } from '@/Domain/Entity';

export interface ProjectDesignResponse {
    id: number;
    project_id: number;
    design_id: number;
    created_at: string;
    updated_at: string;
}

export class ProjectDesignFactory {
    static createFromResponse(res: ProjectDesignResponse): ProjectDesign {
        return new ProjectDesign(
            res.id,
            res.project_id,
            res.design_id,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
