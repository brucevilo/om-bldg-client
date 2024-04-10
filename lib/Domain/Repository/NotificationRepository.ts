import { MappedFetchPagenateData } from '@/App/Service';
import { Notification } from '@/Domain/Entity';
import { NotificationFactory, NotificationResponse } from '@/Domain/Factory';
import { getClient } from '@/Infrastructure';
import { map } from 'lodash';

export class NotificationRepository {
    static async index(): Promise<Notification[]> {
        const res = await getClient().get<NotificationResponse[]>(
            '/notifications',
        );
        return map(res.data, NotificationFactory.createFromResponse);
    }

    static async get(id: number): Promise<Notification> {
        const res = await getClient().get<NotificationResponse>(
            `/notifications/${id}`,
        );

        return NotificationFactory.createFromResponse(res.data);
    }

    static async search(
        page: number,
    ): Promise<MappedFetchPagenateData<Notification>> {
        const searchParams = new URLSearchParams();
        searchParams.append('page', page.toString());
        const res = await getClient().get<NotificationResponse[]>(
            `/notifications?${searchParams}`,
        );
        return {
            values: res.data.map(NotificationFactory.createFromResponse),
            totalPages: Number(res.headers['total-pages']),
        };
    }
}
