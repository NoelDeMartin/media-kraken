import { defineSchema } from 'soukai-bis';
import { url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'WatchAction',
    history: true,
    fields: {
        showUrl: url().rdfProperty('object'),
        statusUrl: url().rdfProperty('actionStatus').optional(),
    },
});
