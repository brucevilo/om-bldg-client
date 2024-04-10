import { getClient } from '@/Infrastructure';
import { SupplierResponse, SupplierFactory } from '../Factory';
import { Supplier } from '../Entity';

interface EditSupplierRequest {
    name: string;
    code: number;
    contact: string;
}
interface SupplierFileRequest {
    file: File;
}

export class SupplierRepository {
    static async list(): Promise<Supplier[]> {
        const res = await getClient().get<SupplierResponse[]>('/suppliers');
        return res.data.map(SupplierFactory.createFromResponse);
    }

    static async downloadCsv(): Promise<void> {
        const res = await getClient().get<string>('/suppliers/csv');
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        const url = URL.createObjectURL(new Blob([bom, res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'suppliers.csv');
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
    }

    static async store({
        id,
        name,
        code,
        contact,
    }: Supplier): Promise<Supplier> {
        const res = id
            ? await getClient().patch<EditSupplierRequest, SupplierResponse>(
                  `/suppliers/${id}`,
                  {
                      name,
                      code,
                      contact,
                  },
              )
            : await getClient().post<EditSupplierRequest, SupplierResponse>(
                  '/suppliers',
                  {
                      name,
                      code,
                      contact,
                  },
              );
        return SupplierFactory.createFromResponse(res.data);
    }

    static async storeCsv(csvFile: File): Promise<Supplier> {
        const params: SupplierFileRequest = {
            file: csvFile,
        };
        const res = await getClient().formPost<
            SupplierFileRequest,
            SupplierResponse
        >('/suppliers/csv', params);
        return SupplierFactory.createFromResponse(res.data);
    }
}
