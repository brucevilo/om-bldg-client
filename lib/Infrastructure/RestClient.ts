import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { snakeCase } from 'lodash';
import { getAccessToken } from '.';

export class RestClient {
    constructor(private readonly token: string) {}

    async get<ResponseInterface>(
        path: string,
    ): Promise<AxiosResponse<ResponseInterface>> {
        return await axios.get<ResponseInterface>(path, this.requestConfig);
    }

    async getFile(path: string): Promise<AxiosResponse<Blob>> {
        return await axios.get(path, {
            ...this.requestConfig,
            responseType: 'blob',
        });
    }

    async post<RequestInterface, ResponseInterface>(
        path: string,
        body: RequestInterface,
    ): Promise<AxiosResponse<ResponseInterface>> {
        return await axios.post<ResponseInterface>(
            path,
            body,
            this.requestConfig,
        );
    }

    async formPost<RequestInterface, ResponseInterface>(
        path: string,
        body: RequestInterface | Record<string, unknown>,
    ): Promise<AxiosResponse<ResponseInterface>> {
        const form = this.requestParamsToFormData(body);
        return await axios.post<ResponseInterface>(
            path,
            form,
            this.formRequestConfig,
        );
    }

    async patch<RequestInterface, ResponseInterface>(
        path: string,
        body: RequestInterface,
    ): Promise<AxiosResponse<ResponseInterface>> {
        return await axios.patch<ResponseInterface>(
            path,
            body,
            this.requestConfig,
        );
    }

    async formPatch<RequestInterface, ResponseInterface>(
        path: string,
        body: RequestInterface,
    ): Promise<AxiosResponse<ResponseInterface>> {
        const form = this.requestParamsToFormData(body);
        return await axios.patch<ResponseInterface>(
            path,
            form,
            this.formRequestConfig,
        );
    }

    async formPatchForFileDownload<RequestInterface>(
        path: string,
        body: RequestInterface,
    ): Promise<AxiosResponse<Blob>> {
        const form = this.requestParamsToFormData(body);
        return await axios.patch(
            path,
            form,
            this.formFileDownloadRequestConfig,
        );
    }

    async delete(path: string): Promise<AxiosResponse> {
        return await axios.delete(path, this.requestConfig);
    }

    private get requestConfig(): AxiosRequestConfig {
        const accessToken = getAccessToken();
        const authoriationParams = accessToken
            ? {
                  Authorization: `Bearer ${accessToken}`,
              }
            : ({} as Record<string, string>);
        return {
            baseURL: process.env.NEXT_PUBLIC_API_ORIGIN,
            headers: {
                'Content-Type': 'application/json',
                ...authoriationParams,
            },
        };
    }

    private get formRequestConfig(): AxiosRequestConfig {
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

    private get formFileDownloadRequestConfig(): AxiosRequestConfig {
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
            responseType: 'blob',
        };
    }

    private requestParamsToFormData<RequestInterface>(
        params: RequestInterface,
    ) {
        const form = new FormData();
        /* eslint-disable @typescript-eslint/no-explicit-any */
        Object.keys(params as any).forEach((key: string) => {
            if (Array.isArray((params as any)[key])) {
                (
                    (params as any)[key] as
                        | string[]
                        | number[]
                        | Blob[]
                        | Record<string, unknown>[]
                )
                    /* eslint-enable @typescript-eslint/no-explicit-any */
                    .forEach(v => {
                        if (typeof v === 'object') {
                            Object.keys(v).forEach(wbsKey => {
                                form.append(
                                    `${snakeCase(key)}[][${wbsKey}]`,
                                    (v as Record<string, unknown>)[
                                        `${wbsKey}`
                                    ] as string | Blob,
                                );
                            });
                        } else {
                            form.append(
                                `${snakeCase(key)}[]`,
                                v as string | Blob,
                            );
                        }
                    });
            } else {
                form.append(
                    snakeCase(key),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (params as any)[key] as string | Blob,
                );
            }
        });
        return form;
    }
}

export function getClient(): RestClient {
    return new RestClient(getAccessToken() || '');
}

export function getNoAuthClient(): RestClient {
    return new RestClient('');
}
