import { Deflator } from '@/Domain/Entity';

export interface EditDeflatorForm {
    id: number | null;
    year: string;
    rate: string;
}

export class EditDeflator {
    static createEmptyForm(): EditDeflatorForm {
        return {
            id: null,
            year: '',
            rate: '',
        };
    }

    static deflatorToForm(deflator: Deflator): EditDeflatorForm {
        return {
            id: deflator.id,
            year: String(deflator.year),
            rate: String(deflator.rate.toFixed(1)),
        };
    }

    static formToDeflate(form: EditDeflatorForm): Deflator {
        return new Deflator(
            form.id,
            Number(form.year),
            Number(form.rate),
            new Date(),
            new Date(),
        );
    }
}
