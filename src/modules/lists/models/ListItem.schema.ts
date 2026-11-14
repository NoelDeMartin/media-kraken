import { belongsToOne, defineSchema } from 'soukai-bis';
import { number, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'ListItem',
    history: true,
    fields: {
        mediaUrl: url().rdfProperty('item'),
        position: number(),
    },
    relations: {
        movie: belongsToOne('Movie', 'mediaUrl').usingSameDocument().onDelete('cascade'),
        show: belongsToOne('Show', 'mediaUrl').usingSameDocument().onDelete('cascade'),
    },
});
