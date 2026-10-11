import { describe, expect, it } from 'vite-plus/test';

import { shuffle } from './arrays';

describe('array helpers', () => {
    it('shuffles arrays', async () => {
        const items = [1, 2, 3, 4, 5];
        const shuffled = shuffle(items);

        expect(shuffled).not.toBe(items);
        expect(items).toEqual([1, 2, 3, 4, 5]);
        expect([...shuffled].sort((a, b) => a - b)).toEqual(items);
    });
});
