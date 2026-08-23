import { belongsToOne, defineSchema } from 'soukai-bis';
import { date, url } from 'zod';

import type Movie from './Movie';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'WatchAction',
    fields: {
        object: url().rdfProperty('object').optional(),
        startTime: date().rdfProperty('startTime').optional(),
        endTime: date().rdfProperty('endTime').optional(),
    },
    relations: {
        movie: belongsToOne(() => (globalThis as Record<string, unknown>).Movie as typeof Movie, 'object'),
    },
});
