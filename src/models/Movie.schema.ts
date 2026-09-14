import { belongsToMany, defineSchema, hasMany, requireBootedModel } from 'soukai-bis';
import { array, date, string, url } from 'zod';

import Person from '@/models/Person';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Movie',
    fields: {
        title: string().rdfProperty('name'),
        description: string().optional(),
        releaseDate: date().rdfProperty('datePublished').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
        genreUrls: array(url()).rdfProperty('genre').default([]),
        actorUrls: array(url()).rdfProperty('actor').default([]),
        directorUrls: array(url()).rdfProperty('director').default([]),
        countryUrls: array(url()).rdfProperty('countryOfOrigin').default([]),
        languages: array(string()).rdfProperty('inLanguage').default([]),
        duration: string().optional(),
    },
    relations: {
        watchActions: hasMany(() => requireBootedModel('WatchAction'), 'object').usingSameDocument(),
        actors: belongsToMany(Person, 'actorUrls').usingSameDocument(),
        directors: belongsToMany(Person, 'directorUrls').usingSameDocument(),
    },
});
