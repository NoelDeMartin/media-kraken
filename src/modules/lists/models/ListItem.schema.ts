import { defineSchema } from 'soukai-bis';
import { array, number, string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'ListItem',
    history: true,
    fields: {
        mediaUrl: url().rdfProperty('item'),
        position: number(),
        name: string().optional(),
        imageUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
        // TODO something to tell whether this is a TV show or movie? (maybe when we think about the viewer...)
    },
});
