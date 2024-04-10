import { useState, useEffect } from 'react';

export const useDebounce = (value: boolean, delay: number): boolean => {
    const [debouncedValue, setDebouncedValue] = useState<boolean>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
};
