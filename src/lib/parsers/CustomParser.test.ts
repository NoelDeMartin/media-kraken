import { describe, expect, it } from 'vite-plus/test';

import CustomParser from './CustomParser';

describe('CustomParser', () => {
    it('parses ratings', async () => {
        const media = await CustomParser.parse([
            { name: 'Spirited Away', rating: '10' },
            { name: 'The Matrix', rating: ' 7 ' },
            { name: 'Inception', rating: '0' },
        ]);

        expect(media.map(({ rating }) => rating)).toEqual([10, 7, 0]);
    });

    it('ignores missing ratings', async () => {
        const media = await CustomParser.parse([{ name: 'Spirited Away' }, { name: 'The Matrix', rating: '  ' }]);

        expect(media.map(({ rating, validationError }) => ({ rating, validationError }))).toEqual([
            { rating: undefined, validationError: undefined },
            { rating: undefined, validationError: undefined },
        ]);
    });

    it('rejects invalid ratings', async () => {
        const media = await CustomParser.parse([
            { name: 'Spirited Away', rating: '7.5' },
            { name: 'The Matrix', rating: '11' },
            { name: 'Inception', rating: '-1' },
            { name: 'Interstellar', rating: 'abc' },
        ]);

        for (const { rating, validationError } of media) {
            expect(rating).toBeUndefined();
            expect(validationError).toContain('Rating must be a whole number between 0 and 10');
        }
    });
});
