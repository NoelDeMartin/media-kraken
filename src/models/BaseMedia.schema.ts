import { belongsToMany, defineSchema, hasOne } from 'soukai-bis';
import { array, string, url } from 'zod';

import Note from './Note';
import PerformanceRole from './PerformanceRole';
import Review from './Review';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    history: true,
    fields: {
        description: string().optional(),
        posterUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
        genreUrls: array(url()).rdfProperty('genre').default([]),
        actorUrls: array(url()).rdfProperty('actor').default([]),
        countryUrls: array(url()).rdfProperty('countryOfOrigin').default([]),
        languages: array(string()).rdfProperty('inLanguage').default([]),
    },
    relations: {
        cast: belongsToMany(PerformanceRole, 'actorUrls').usingSameDocument().autoload(false),
        review: hasOne(Review, 'itemReviewedUrl').usingSameDocument(),
        note: hasOne(Note, 'aboutUrl').usingSameDocument(),
    },
});
