import { defineSchema, hasOne, requireBootedModel } from 'soukai-bis';
import { array, date, string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVSeries',
    fields: {
        name: string(),
        description: string().optional(),
        startDate: date().rdfProperty('startDate').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        backdropUrl: url().rdfProperty('thumbnailUrl').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
    },
    relations: {
        watching: hasOne(() => requireBootedModel('ShowWatching'), 'showUrl').usingSameDocument(),
    },
});
