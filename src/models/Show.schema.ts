import { belongsToMany, defineSchema, hasOne, requireBootedModel } from 'soukai-bis';
import { array, date, number, string, url } from 'zod';

import PerformanceRole from '@/models/PerformanceRole';
import Person from '@/models/Person';
import Season from '@/models/Season';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVSeries',
    history: true,
    fields: {
        name: string(),
        description: string().optional(),
        startDate: date().rdfProperty('startDate').optional(),
        posterUrl: url().rdfProperty('image').optional(),
        backdropUrl: url().rdfProperty('thumbnailUrl').optional(),
        genreUrls: array(url()).rdfProperty('genre').default([]),
        actorUrls: array(url()).rdfProperty('actor').default([]),
        creatorUrls: array(url()).rdfProperty('creator').default([]),
        countryUrls: array(url()).rdfProperty('countryOfOrigin').default([]),
        languages: array(string()).rdfProperty('inLanguage').default([]),
        seasonUrls: array(url()).rdfProperty('containsSeason').default([]),
        externalUrls: array(url()).rdfProperty('sameAs').default([]),
        _numberOfSeasons: number().rdfProperty('numberOfSeasons').optional(),
        _numberOfEpisodes: number().rdfProperty('numberOfEpisodes').optional(),
    },
    relations: {
        cast: belongsToMany(PerformanceRole, 'actorUrls').usingSameDocument().autoload(false),
        creators: belongsToMany(Person, 'creatorUrls').usingSameDocument().autoload(false),
        seasons: belongsToMany(Season, 'seasonUrls').usingSameDocument(),
        watching: hasOne(() => requireBootedModel('ShowWatching'), 'showUrl').usingSameDocument(),
    },
});
