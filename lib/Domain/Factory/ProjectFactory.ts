import { Project, ProjectClassification } from '@/Domain/Entity';
import { AttachmentInfo } from '../ValueObject';

export interface ProjectResponse {
    id: number;
    name: string;
    code: string;
    budget: number;
    file_info: AttachmentInfo;
    note: string;
    classification: ProjectClassification;
    target_year: number;
    created_at: string;
    updated_at: string;
}

export class ProjectFactory {
    static createFromResponse(res: ProjectResponse): Project {
        return new Project(
            res.id,
            res.name,
            res.code,
            res.budget,
            null,
            res.file_info,
            res.note,
            res.classification,
            res.target_year,
            new Date(res.created_at),
            new Date(res.updated_at),
        );
    }
}
