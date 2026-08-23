import { defineSchema, hasMany } from 'soukai-bis';
import { array, date, string, url } from 'zod';

import type WatchAction from './WatchAction';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Movie',
    fields: {
        title: string().rdfProperty('name'),
        description: string().rdfProperty('description').optional(),
        releaseDate: date().rdfProperty('datePublished').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
    },
    relations: {
        actions: hasMany(
            () => (globalThis as Record<string, unknown>).WatchAction as typeof WatchAction,
            'object',
        ).usingSameDocument(),
    },
});
