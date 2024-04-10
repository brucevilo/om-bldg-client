import { Project, ProjectClassification } from '@/Domain/Entity';
import { AttachmentInfo } from '@/Domain/ValueObject';

export interface EditProjectForm {
    id: number | null;
    name: string;
    code: string;
    budget: string;
    file: File | null;
    fileInfo: AttachmentInfo;
    note: string;
    classification: ProjectClassification;
    targetYear: number | null;
    createdAt: Date;
    updatedAt: Date;
}

export class EditProject {
    static createEmptyForm(): EditProjectForm {
        return {
            id: null,
            name: '',
            code: '',
            budget: '',
            file: null,
            fileInfo: { path: '', filename: '' },
            note: '',
            classification: ProjectClassification.InvestmentBudget,
            targetYear: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    static projectToForm(project: Project): EditProjectForm {
        return {
            id: project.id,
            name: project.name,
            code: project.code.toString(),
            budget: project.budget.toString(),
            file: project.file,
            fileInfo: project.fileInfo,
            note: project.note,
            classification: project.classification,
            targetYear: project.targetYear,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }

    static formToProject(form: EditProjectForm): Project {
        return new Project(
            form.id,
            form.name,
            form.code,
            Number(form.budget),
            form.file,
            form.fileInfo,
            form.note,
            form.classification,
            form.targetYear,
            form.createdAt,
            form.updatedAt,
        );
    }
}
