import { defineSchema } from 'soukai-bis';
import { array, string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Person',
    fields: {
        name: string(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
    },
});
