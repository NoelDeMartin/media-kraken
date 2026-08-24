import { defineSchema, hasMany, requireBootedModel } from 'soukai-bis';
import { array, date, string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Movie',
    fields: {
        title: string().rdfProperty('name'),
        description: string().optional(),
        releaseDate: date().rdfProperty('datePublished').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
    },
    relations: {
        watchActions: hasMany(() => requireBootedModel('WatchAction'), 'object').usingSameDocument(),
    },
});
