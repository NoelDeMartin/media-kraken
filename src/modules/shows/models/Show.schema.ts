import { belongsToMany, defineSchema, hasOne, requireBootedModel } from 'soukai-bis';
import { array, date, number, string, url } from 'zod';

import BaseMedia from '@/models/BaseMedia';
import Person from '@/models/Person';

import Season from './Season';

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
        creators: belongsToMany(Person, 'creatorUrls').usingSameDocument().autoload(false),
        seasons: belongsToMany(Season, 'seasonUrls').usingSameDocument(),
        watching: hasOne(() => requireBootedModel('ShowWatching'), 'showUrl').usingSameDocument(),
    },
});
