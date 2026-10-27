import { describe, expect, it } from 'vite-plus/test';

import { notesPreview } from './media';

describe('Media', () => {
    it('Renders previews as text', () => {
        expect(notesPreview('Recommended by **Alice**')).toBe('Recommended by Alice');
    });

    it('Truncates long previews', () => {
        const preview = notesPreview(`${'a'.repeat(299)}🍿🍿`);

        expect(preview).toBe(`${'a'.repeat(299)}🍿…`);
    });
});
