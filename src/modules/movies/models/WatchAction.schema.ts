import { belongsToOne, defineSchema, requireBootedModel } from 'soukai-bis';
import { date, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'WatchAction',
    history: true,
    fields: {
        object: url().rdfProperty('object'),
        endTime: date().rdfProperty('endTime').optional(),
        statusUrl: url().rdfProperty('actionStatus').optional(),
    },
    relations: {
        movie: belongsToOne(() => requireBootedModel('Movie'), 'object'),
    },
});
