import { DeflatorService } from '@/Domain/Service';
import { dummyDeflator } from '@/__test__/dummy';

test('culcDeflate', () => {
    const deflatedPrice = DeflatorService.calcDeflate(7777, dummyDeflator());
    expect(deflatedPrice).toBe(6221);
});
