import { belongsToMany, defineSchema, hasOne, requireBootedModel } from 'soukai-bis';
import { array, date, string, url } from 'zod';

import Season from '@/models/Season';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVSeries',
    fields: {
        name: string(),
        description: string().optional(),
        startDate: date().rdfProperty('startDate').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        backdropUrl: url().rdfProperty('thumbnailUrl').optional(),
        seasonUrls: array(url()).rdfProperty('containsSeason').default([]),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
    },
    relations: {
        seasons: belongsToMany(Season, 'seasonUrls').usingSameDocument(),
        watching: hasOne(() => requireBootedModel('ShowWatching'), 'showUrl').usingSameDocument(),
    },
});
