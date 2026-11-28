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
        movie: belongsToOne('ListMovie', 'mediaUrl').usingSameDocument().onDelete('cascade'),
        show: belongsToOne('ListShow', 'mediaUrl').usingSameDocument().onDelete('cascade'),
    },
});
