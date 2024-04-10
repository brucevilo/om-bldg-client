import { Contract } from '@/Domain/Entity';
import { CostDocument } from '@/Domain/ValueObject';
import { getClient, Excel } from '@/Infrastructure';

export const fetchCostDocument = async (
    contract: Contract,
): Promise<CostDocument> => {
    const urlResponse = await getClient().get<{ url: string }>(
        `/contracts/${contract.id}/raw_cost_document_url`,
    );
    const res = await fetch(urlResponse.data.url);
    const file = new File([await res.blob()], 'costdocument.xlsm', {
        lastModified: Date.now(),
    });
    const book = await Excel.read(file);
    return new CostDocument(book);
};

export const fetchDocument = async (
    filepath: string,
    filename: string,
): Promise<File> => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_ORIGIN + filepath);
    const file = new File([await res.blob()], filename, {
        lastModified: Date.now(),
    });
    return file;
};
