import { defineSchema } from 'soukai-bis';
import { number } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'Rating',
    history: true,
    fields: {
        ratingValue: number(),
    },
});
