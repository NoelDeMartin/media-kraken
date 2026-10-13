import { describe, expect, it } from 'vite-plus/test';

import { arrayMax, shuffle } from './arrays';

describe('array helpers', () => {
    it('finds the item with the highest value', () => {
        const items = [
            { id: 'a', value: 1 },
            { id: 'b', value: 3 },
            { id: 'c', value: 3 },
        ];

        expect(arrayMax(items, (item) => item.value)?.id).toBe('b');
        expect(arrayMax([], () => 0)).toBeNull();
    });

    it('shuffles arrays', async () => {
        const items = [1, 2, 3, 4, 5];
        const shuffled = shuffle(items);

        expect(shuffled).not.toBe(items);
        expect(items).toEqual([1, 2, 3, 4, 5]);
        expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
    });
});
