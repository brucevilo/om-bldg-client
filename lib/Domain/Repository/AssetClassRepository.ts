import { getClient } from '@/Infrastructure';
import { AssetClassResponse, AssetClassFactory } from '../Factory';
import { AssetClass } from '../Entity';

interface EditAssetClassRequest {
    name: string;
    code: number | null;
    account_division: string;
    useful_life: number | null;
    category: string;
    account_item_kou: string;
    account_item_moku: string;
}

export class AssetClassRepository {
    static async list(): Promise<AssetClass[]> {
        const res = await getClient().get<AssetClassResponse[]>(
            '/asset_classes',
        );
        return res.data.map(AssetClassFactory.createFromResponse);
    }

    static async store({
        id,
        name,
        accountDivision,
        code,
        usefulLife,
        category,
        accountItemMoku,
        accountItemKou,
    }: AssetClass): Promise<AssetClass> {
        const res = id
            ? await getClient().patch<
                  EditAssetClassRequest,
                  AssetClassResponse
              >(`/asset_classes/${id}`, {
                  name,
                  'account_division': accountDivision,
                  code,
                  'useful_life': usefulLife,
                  category,
                  'account_item_moku': accountItemMoku,
                  'account_item_kou': accountItemKou,
              })
            : await getClient().post<EditAssetClassRequest, AssetClassResponse>(
                  '/asset_classes',
                  {
                      name,
                      'account_division': accountDivision,
                      code,
                      'useful_life': usefulLife,
                      category,
                      'account_item_moku': accountItemMoku,
                      'account_item_kou': accountItemKou,
                  },
              );
        return AssetClassFactory.createFromResponse(res.data);
    }
}
