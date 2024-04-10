import { Project } from '@/Domain/Entity';
import { ProjectRepository } from '@/Domain/Repository';
import { useEffect, useState } from 'react';

export const useProjects = (): Project[] => {
    const [projects, setProjects] = useState<Project[]>([]);

    const fetchData = async () => {
        setProjects(await ProjectRepository.index());
    };

    useEffect(() => {
        fetchData();
    }, []);

    return projects;
};
