import { defineSchema } from 'soukai-bis';
import { string, boolean, url, date, array } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Movie',
    fields: {
        title: string().rdfProperty('name'),
        releaseDate: date().rdfProperty('datePublished').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
        watched: boolean().optional(),
    },
});
