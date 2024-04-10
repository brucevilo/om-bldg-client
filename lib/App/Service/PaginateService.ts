export type MappedFetchPagenateData<T> = {
    values: T[];
    totalPages: number | undefined;
};
import { range } from 'lodash';

interface ButtonPositions {
    firstButton?: number;
    middleButtons: number[];
    lastButton?: number;
}

export const buttonPositions = (
    totalPages: number,
    pageNum: number,
): ButtonPositions => {
    if (totalPages <= 5) {
        return { middleButtons: range(1, totalPages + 1) };
    }
    if (totalPages > 5 && pageNum < 4) {
        return { middleButtons: range(1, 4 + 1), lastButton: totalPages };
    }
    if (totalPages > 5 && pageNum >= 4 && pageNum + 2 < totalPages) {
        return {
            firstButton: 1,
            middleButtons: range(pageNum - 1, pageNum + 2),
            lastButton: totalPages,
        };
    }

    return {
        firstButton: 1,
        middleButtons: range(totalPages - 3, totalPages + 1),
    };
};
