import { buttonPositions } from '@/App/Service';

describe('button_positions', () => {
    it('total: 4, pageNum: 1', () => {
        const positions = buttonPositions(4, 1);
        expect(positions.firstButton).toBeUndefined();
        expect(positions.middleButtons).toEqual([1, 2, 3, 4]);
        expect(positions.lastButton).toBeUndefined();
    });

    it('total: 6, pageNum: 2', () => {
        const positions = buttonPositions(6, 2);
        expect(positions.firstButton).toBeUndefined();
        expect(positions.middleButtons).toEqual([1, 2, 3, 4]);
        expect(positions.lastButton).toBe(6);
    });

    it('total: 10, pageNum: 7', () => {
        const positions = buttonPositions(10, 7);
        expect(positions.firstButton).toBe(1);
        expect(positions.middleButtons).toEqual([6, 7, 8]);
        expect(positions.lastButton).toBe(10);
    });

    it('total: 8, pageNum: 7', () => {
        const positions = buttonPositions(8, 7);
        expect(positions.firstButton).toBe(1);
        expect(positions.middleButtons).toEqual([5, 6, 7, 8]);
        expect(positions.lastButton).toBeUndefined();
    });
});
