import { belongsToMany, defineSchema, hasMany } from 'soukai-bis';
import { array, date, string, url } from 'zod';

import BaseMedia from '@/models/BaseMedia';

export default defineSchema(BaseMedia, {
    rdfClass: 'Movie',
    fields: {
        title: string().rdfProperty('name'),
        releaseDate: date().rdfProperty('datePublished').optional(),
        directorUrls: array(url()).rdfProperty('director').default([]),
        duration: string().optional(),
    },
    relations: {
        watchActions: hasMany('WatchAction', 'object').usingSameDocument(),
        directors: belongsToMany('Person', 'directorUrls').usingSameDocument().autoload(false),
    },
});
