import { getClient } from '@/Infrastructure';
import { PriceResponse, PriceFactory } from '../Factory';
import { Price } from '../Entity';

interface EditPriceRequest {
    name: string;
    shape_dimension: string;
    price: number;
    code: string;
}
interface PriceFileRequest {
    file: File;
}

export class PriceRepository {
    static async list(): Promise<Price[]> {
        const res = await getClient().get<PriceResponse[]>('/prices');
        return res.data.map(PriceFactory.createFromResponse);
    }

    static async downloadCsv(): Promise<void> {
        const res = await getClient().get<string>('/prices/csv');
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const url = URL.createObjectURL(new Blob([bom, res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'prices.csv');
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
    }

    static async store({
        id,
        name,
        shapeDimension,
        price,
        code,
    }: Price): Promise<Price> {
        const res = id
            ? await getClient().patch<EditPriceRequest, PriceResponse>(
                  `/prices/${id}`,
                  {
                      name,
                      shape_dimension: shapeDimension,
                      price,
                      code,
                  },
              )
            : await getClient().post<EditPriceRequest, PriceResponse>(
                  '/prices',
                  {
                      name,
                      shape_dimension: shapeDimension,
                      price,
                      code,
                  },
              );
        return PriceFactory.createFromResponse(res.data);
    }

    static async storeCsv(csvFile: File): Promise<Price> {
        const params: PriceFileRequest = {
            file: csvFile,
        };
        const res = await getClient().formPost<PriceFileRequest, PriceResponse>(
            '/prices/csv',
            params,
        );
        return PriceFactory.createFromResponse(res.data);
    }
}
