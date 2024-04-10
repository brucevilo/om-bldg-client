import { getClient } from '@/Infrastructure/RestClient';
import { CostItem } from '@/Domain/Entity';
import { CostItemService } from '@/Domain/Service';
import { map, snakeCase } from 'lodash';
import { CostItemFactory, CostItemResponse } from '../Factory';
import { MappedFetchPagenateData } from '@/App/Service';
import { AttachmentInfo } from '../ValueObject';
import axios, { AxiosRequestConfig } from 'axios';
import { assertsIsExists, getAccessToken } from '@/Infrastructure';

interface CreateCostItemRequest {
    name: string;
    unit_price: number;
    amount: number;
    price: number;
    construction_type: string;
    construction_time: string;
    transportation_time: string;
    asset_class_id: number;
    construction_statement_id: number;
    unit: string;
}

interface UpdateCostItemRequest extends CreateCostItemRequest {
    memo: string;
    photos: AttachmentInfo[];
    cost_item_tags_attributes: { name: string }[];
}

export class CostItemRepository {
    static async search(params: {
        tagNames?: string[];
        costItemNames?: string[];
        constructionId?: number;
        isAsset?: boolean;
        assetClassName?: string;
        constructionStatementId?: number;
        filterRetiremented?: boolean;
        page?: number;
        sapRecordedAtStartAt?: string;
        sapRecordedAtEndAt?: string;
        constructionName?: string;
        isLatestContract?: boolean;
    }): Promise<MappedFetchPagenateData<CostItem>> {
        const uriSearchParams = CostItemService.buildSearchParams({
            tagNames: params?.tagNames,
            costItemNames: params?.costItemNames,
            constructionId: params?.constructionId,
            isAsset: params?.isAsset,
            assetClassName: params?.assetClassName,
            constructionStatementId: params?.constructionStatementId,
            filterRetiremented: params?.filterRetiremented,
            page: params?.page,
            sapRecordedAtStartAt: params?.sapRecordedAtStartAt,
            sapRecordedAtEndAt: params?.sapRecordedAtEndAt,
            constructionName: params?.constructionName,
            isLatestContract: params?.isLatestContract,
        });

        const res = await getClient().get<CostItemResponse[]>(
            `/cost_items?${uriSearchParams.toString()}`,
        );
        return {
            values: map(res.data, CostItemFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }

    static async store(params: CreateCostItemRequest): Promise<CostItem> {
        const res = await getClient().post<
            CreateCostItemRequest,
            CostItemResponse
        >('/cost_items', params);
        return CostItemFactory.createFromResponse(res.data);
    }

    static async mget(ids: number[]): Promise<CostItem[]> {
        const urlSearchParams = new URLSearchParams();
        ids.forEach(id => {
            urlSearchParams.append('ids[]', id.toString());
        });
        const res = await getClient().get<CostItemResponse[]>(
            `/cost_items/mget?${urlSearchParams.toString()}`,
        );
        return map(res.data, CostItemFactory.createFromResponse);
    }

    static async get(id: number): Promise<CostItem> {
        const res = await getClient().get<CostItemResponse>(
            `/cost_items/${id}`,
        );
        return CostItemFactory.createFromResponse(res.data);
    }

    static async update(
        { id, memo, costItemTags }: CostItem,
        photos: AttachmentInfo[],
    ): Promise<CostItem> {
        const photosParams = photos.map(info => {
            if (!info) assertsIsExists(info);
            return {
                path: info.path,
                filename: info.filename,
            };
        });
        const costItemTagsParams = costItemTags.map(t => {
            return {
                name: t.name,
            };
        });
        const params: Partial<UpdateCostItemRequest> = {
            photos: photosParams,
            memo,
            cost_item_tags_attributes: costItemTagsParams,
        };
        const form = this.requestParamsToFormData(params);
        const res = await axios.patch<CostItemResponse>(
            `/cost_items/${id}`,
            form,
            this.formRequestConfig,
        );
        return CostItemFactory.createFromResponse(res.data);
    }

    private static requestParamsToFormData<RequestInterface>(
        params: RequestInterface,
    ) {
        const form = new FormData();
        Object.entries(params).forEach(param => {
            if (!param[1]) return;
            if (Array.isArray(param[1])) {
                (param[1] as { [key: string]: string | number }[]).forEach(
                    object => {
                        Object.entries(object).forEach(element => {
                            form.append(
                                `${snakeCase(param[0])}[][${element[0]}]`,
                                element[1].toString(),
                            );
                        });
                    },
                );
            } else {
                form.append(snakeCase(param[0]), param[1] as string | Blob);
            }
        });
        return form;
    }
    private static get formRequestConfig(): AxiosRequestConfig {
        const accessToken = getAccessToken();
        const authoriationParams = accessToken
            ? {
                  Authorization: `Bearer ${accessToken}`,
              }
            : ({} as Record<string, string>);
        return {
            baseURL: process.env.NEXT_PUBLIC_API_ORIGIN,
            headers: {
                ...authoriationParams,
            },
        };
    }
}
