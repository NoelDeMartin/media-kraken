import { isTruthy } from '@noeldemartin/utils';
import { belongsToMany, defineSchema, hasMany, InvalidationStrategies, loaded } from 'soukai-bis';
import { array, date, string, url } from 'zod';

import BaseMedia from '@/models/BaseMedia';

import type { MovieCredits } from './Movie';

export default defineSchema(BaseMedia, {
    rdfClass: 'Movie',
    fields: {
        title: string().rdfProperty('name'),
        releaseDate: date().rdfProperty('datePublished').optional(),
        directorUrls: array(url()).rdfProperty('director').default([]),
        duration: string().optional(),
    },
    relations: {
        watchActions: hasMany('WatchAction', 'object').usingSameDocument().onDelete('cascade'),
        directors: belongsToMany('Person', 'directorUrls').usingSameDocument().autoload(false).onDelete('cascade'),
    },
    computed: {
        credits: {
            invalidationStrategy: InvalidationStrategies.DOCUMENT,
            compute(movie): MovieCredits {
                return {
                    directors: loaded(movie, 'directors').map((director) => director.credit),
                    cast: loaded(movie, 'cast')
                        .map((role) => loaded(role, 'actor'))
                        .filter(isTruthy)
                        .map((actor) => actor.credit),
                };
            },
        },
    },
});
