import { defineSchema } from 'soukai-bis';
import { url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'WatchAction',
    fields: {
        showUrl: url().rdfProperty('object'),
        statusUrl: url().rdfProperty('actionStatus').optional(),
    },
});
