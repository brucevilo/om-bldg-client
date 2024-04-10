import { Supplier } from '@/Domain/Entity';

export interface EditSupplierForm {
    id: number;
    name: string;
    code: string;
    contact: string;
}

export class EditSupplier {
    static createEmptyForm(): EditSupplierForm {
        return {
            id: 0,
            name: '',
            code: '',
            contact: '',
        };
    }

    static supplierToForm(supplier: Supplier): EditSupplierForm {
        return {
            id: supplier.id,
            name: supplier.name,
            code: String(supplier.code),
            contact: supplier.contact,
        };
    }

    static formToSupplier(form: EditSupplierForm): Supplier {
        return new Supplier(
            form.id,
            form.name,
            Number(form.code),
            form.contact,
            new Date(),
            new Date(),
        );
    }
}
