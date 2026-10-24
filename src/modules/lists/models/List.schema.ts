import { belongsToMany, defineSchema } from 'soukai-bis';
import { array, string, url } from 'zod';

import ListItem from './ListItem';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'ItemList',
    history: true,
    fields: {
        name: string(),
        itemUrls: array(url()).rdfProperty('itemListElement').default([]),
    },
    relations: {
        items: belongsToMany(ListItem, 'itemUrls').usingSameDocument(),
    },
});
