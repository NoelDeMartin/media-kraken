import { describe, expect, it } from 'vite-plus/test';

import { parseSort, serializeSort } from './filters';

describe('filters sorting helpers', () => {
    it('parses sort queries', () => {
        expect(parseSort(null)).toEqual([]);
        expect(parseSort('')).toEqual([]);
        expect(parseSort('   ')).toEqual([]);

        expect(parseSort('name')).toEqual([{ field: 'name', direction: 'asc' }]);
        expect(parseSort('-name')).toEqual([{ field: 'name', direction: 'desc' }]);
        expect(parseSort('name:asc')).toEqual([{ field: 'name', direction: 'asc' }]);
        expect(parseSort('name:desc')).toEqual([{ field: 'name', direction: 'desc' }]);

        expect(parseSort('name:asc,releaseYear:desc')).toEqual([
            { field: 'name', direction: 'asc' },
            { field: 'releaseYear', direction: 'desc' },
        ]);
        expect(parseSort(' name:asc , rating:desc ')).toEqual([
            { field: 'name', direction: 'asc' },
            { field: 'rating', direction: 'desc' },
        ]);
    });

    it('serializes sort state', () => {
        expect(serializeSort([])).toBeNull();
        expect(serializeSort([{ field: 'name', direction: 'asc' }])).toBe('name:asc');
        expect(serializeSort([{ field: 'name', direction: 'desc' }])).toBe('name:desc');
        expect(
            serializeSort([
                { field: 'name', direction: 'asc' },
                { field: 'releaseYear', direction: 'desc' },
            ]),
        ).toBe('name:asc,releaseYear:desc');
    });
});
