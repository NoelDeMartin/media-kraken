import { defineSchema, hasOne } from 'soukai-bis';
import { date, number, string } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'TVEpisode',
    history: true,
    fields: {
        name: string(),
        number: number().rdfProperty('episodeNumber'),
        publishedAt: date().rdfProperty('datePublished').optional(),
    },
    relations: {
        season: hasOne('Season', 'episodeUrls'),
        watched: hasOne('EpisodeWatched', 'episodeUrl').usingSameDocument(),
    },
});
