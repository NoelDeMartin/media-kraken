import { belongsToOne, defineSchema } from 'soukai-bis';
import { array, string, url } from 'zod';

import Person from '@/models/Person';

export default defineSchema({
    rdfContext: 'https://schema.org/',
    rdfClass: 'PerformanceRole',
    history: true,
    fields: {
        actorUrl: url().rdfProperty('actor'),
        characterNames: array(string()).rdfProperty('characterName').default([]),
    },
    relations: {
        actor: belongsToOne(Person, 'actorUrl').usingSameDocument(),
    },
});
