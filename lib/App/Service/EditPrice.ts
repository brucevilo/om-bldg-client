import { Price } from '@/Domain/Entity';

export interface EditPriceForm {
    id: number | null;
    code: string;
    name: string;
    shapeDimension: string;
    price: string;
}

export class EditPrice {
    static createEmptyForm(): EditPriceForm {
        return {
            id: null,
            code: '',
            name: '',
            shapeDimension: '',
            price: '',
        };
    }

    static priceToForm(price: Price): EditPriceForm {
        return {
            id: price.id,
            code: price.code,
            name: price.name,
            shapeDimension: price.shapeDimension,
            price: String(price.price),
        };
    }

    static formToPrice(form: EditPriceForm): Price {
        return new Price(
            form.id,
            form.code,
            form.name,
            form.shapeDimension,
            Number(form.price),
            new Date(),
            new Date(),
        );
    }
}
