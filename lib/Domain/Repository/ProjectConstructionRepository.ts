import { getClient } from '@/Infrastructure';
import { ProjectConstruction } from '../Entity';
import {
    ProjectConstructionFactory,
    ProjectConstructionResponse,
} from '../Factory';

export class ProjectConstructionRepository {
    static async index(): Promise<ProjectConstruction[]> {
        const res = await getClient().get<ProjectConstructionResponse[]>(
            '/project_constructions',
        );
        return res.data.map(ProjectConstructionFactory.createFromResponse);
    }
}
