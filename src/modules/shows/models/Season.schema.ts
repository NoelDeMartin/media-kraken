import { belongsToMany, defineSchema, hasOne } from 'soukai-bis';
import { array, number, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVSeason',
    history: true,
    fields: {
        number: number().rdfProperty('seasonNumber'),
        episodeUrls: array(url()).rdfProperty('episode').default([]),
    },
    relations: {
        show: hasOne('Show', 'seasonUrls'),
        episodes: belongsToMany('Episode', 'episodeUrls'),
    },
});
