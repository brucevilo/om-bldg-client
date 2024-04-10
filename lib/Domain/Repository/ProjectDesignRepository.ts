import { getClient } from '@/Infrastructure';
import { ProjectDesign } from '../Entity';
import { ProjectDesignFactory, ProjectDesignResponse } from '../Factory';

export class ProjectDesignRepository {
    static async index(): Promise<ProjectDesign[]> {
        const res = await getClient().get<ProjectDesignResponse[]>(
            '/project_designs',
        );
        return res.data.map(ProjectDesignFactory.createFromResponse);
    }
}
