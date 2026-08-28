import { belongsToOne, defineSchema, requireBootedModel } from 'soukai-bis';
import { date, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'WatchAction',
    timestamps: false,
    fields: {
        episodeUrl: url().rdfProperty('object'),
        date: date().rdfProperty('endTime').optional(),
    },
    relations: {
        episode: belongsToOne(() => requireBootedModel('Episode'), 'episodeUrl'),
    },
});
