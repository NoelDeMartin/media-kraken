import { belongsToMany, defineSchema } from 'soukai-bis';
import { array, string, url } from 'zod';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'ItemList',
    history: true,
    fields: {
        name: string().useAsSlug(),
        description: string().optional(),
        itemUrls: array(url()).rdfProperty('itemListElement').default([]),
    },
    relations: {
        items: belongsToMany('ListItem', 'itemUrls').usingSameDocument(),
    },
});
