import { Deflator } from '@/Domain/Entity';

export class DeflatorService {
    public static calcDeflate(price: number, deflator: Deflator): number {
        const deflatedPrice = Math.floor((price * deflator.rate) / 100);
        return deflatedPrice;
    }
}
