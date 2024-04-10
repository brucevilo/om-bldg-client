import { Construction, MigrationStatus } from '@/Domain/Entity';
import { DocumentNumber } from '@/Domain/ValueObject/DocumentNumber';

export interface EditConstructionForm {
    id: number | null;
    projectCodes: string[];
    name: string;
    documentNumber: string;
}

export class EditConstruction {
    static createEmptyFrom(): EditConstructionForm {
        return {
            id: null,
            projectCodes: [],
            name: '',
            documentNumber: '',
        };
    }

    static formToConstruction(form: EditConstructionForm): Construction {
        return new Construction(
            form.id,
            form.name,
            new DocumentNumber(form.documentNumber),
            [],
            new Date(),
            new Date(),
            false,
            MigrationStatus.Open,
        );
    }
}
