import { belongsToMany, defineSchema, hasOne, requireBootedModel } from 'soukai-bis';
import { array, number, url } from 'zod';

import Episode from '@/models/Episode';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVSeason',
    fields: {
        number: number().rdfProperty('seasonNumber'),
        episodeUrls: array(url()).rdfProperty('episode').default([]),
    },
    relations: {
        show: hasOne(() => requireBootedModel('Show'), 'seasonUrls'),
        episodes: belongsToMany(Episode, 'episodeUrls'),
    },
});
