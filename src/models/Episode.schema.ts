import { defineSchema, hasOne, requireBootedModel } from 'soukai-bis';
import { date, number, string } from 'zod';

import EpisodeWatched from '@/models/EpisodeWatched';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVEpisode',
    fields: {
        name: string(),
        number: number().rdfProperty('episodeNumber'),
        publishedAt: date().rdfProperty('datePublished').optional(),
    },
    relations: {
        season: hasOne(() => requireBootedModel('Season'), 'episodeUrls'),
        watched: hasOne(EpisodeWatched, 'episodeUrl').usingSameDocument(),
    },
});
