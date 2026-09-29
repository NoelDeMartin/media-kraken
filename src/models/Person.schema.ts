import { defineSchema } from 'soukai-bis';
import { array, string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Person',
    history: true,
    fields: {
        name: string(),
        imageUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
    },
});
