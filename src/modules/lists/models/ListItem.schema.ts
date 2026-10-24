import { defineSchema } from 'soukai-bis';
import { number, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'ListItem',
    history: true,
    fields: {
        mediaUrl: url().rdfProperty('item'),
        position: number(),
    },
});
