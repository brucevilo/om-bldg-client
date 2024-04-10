import { getClient } from '@/Infrastructure';
import { DeflatorResponse, DeflatorFactory } from '../Factory';
import { Deflator } from '../Entity';

interface EditDeflatorRequest {
    year: number;
    rate: number;
}
interface DeflatorFileRequest {
    file: File;
}

export class DeflatorRepository {
    static async list(): Promise<Deflator[]> {
        const res = await getClient().get<DeflatorResponse[]>('/deflators');
        return res.data.map(DeflatorFactory.createFromResponse);
    }

    static async downloadCsv(): Promise<void> {
        const res = await getClient().get<string>('/deflators/csv');
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const url = URL.createObjectURL(new Blob([bom, res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'deflators.csv');
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
    }

    static async store({ id, year, rate }: Deflator): Promise<Deflator> {
        const res = id
            ? await getClient().patch<EditDeflatorRequest, DeflatorResponse>(
                  `/deflators/${id}`,
                  {
                      year,
                      rate,
                  },
              )
            : await getClient().post<EditDeflatorRequest, DeflatorResponse>(
                  '/deflators',
                  {
                      year,
                      rate,
                  },
              );
        return DeflatorFactory.createFromResponse(res.data);
    }

    static async storeCsv(csvFile: File): Promise<Deflator> {
        const params: DeflatorFileRequest = {
            file: csvFile,
        };
        const res = await getClient().formPost<
            DeflatorFileRequest,
            DeflatorResponse
        >('/deflators/csv', params);
        return DeflatorFactory.createFromResponse(res.data);
    }
}
