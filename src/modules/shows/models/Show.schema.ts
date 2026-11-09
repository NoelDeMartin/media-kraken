import { belongsToMany, defineSchema, hasOne } from 'soukai-bis';
import { array, date, number, string, url } from 'zod';

import BaseMedia from '@/models/BaseMedia';

export default defineSchema(BaseMedia, {
    rdfClass: 'TVSeries',
    fields: {
        name: string(),
        startDate: date().rdfProperty('startDate').optional(),
        backdropUrl: url().rdfProperty('thumbnailUrl').optional(),
        creatorUrls: array(url()).rdfProperty('creator').default([]),
        seasonUrls: array(url()).rdfProperty('containsSeason').default([]),
        _numberOfSeasons: number().rdfProperty('numberOfSeasons').optional(),
        _numberOfEpisodes: number().rdfProperty('numberOfEpisodes').optional(),
    },
    relations: {
        creators: belongsToMany('Person', 'creatorUrls').usingSameDocument().autoload(false),
        seasons: belongsToMany('Season', 'seasonUrls').usingSameDocument(),
        watching: hasOne('ShowWatching', 'showUrl').usingSameDocument(),
    },
});
