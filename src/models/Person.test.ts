import { describe, expect, it } from 'vitest';

import Person from '@/models/Person';

describe('Person model', () => {
    it('Parses TMDB person urls', () => {
        const person = new Person({
            name: 'Keanu Reeves',
            externalUrls: ['https://www.themoviedb.org/person/6384'],
        });

        expect(person.tmdbId).toBe(6384);
    });

    it('creates instance fromTMDB', () => {
        const person = Person.fromTMDB({ id: 6384, name: 'Keanu Reeves' });

        expect(person.name).toBe('Keanu Reeves');
        expect(person.externalUrls).toEqual(['https://www.themoviedb.org/person/6384']);
        expect(person.tmdbId).toBe(6384);
    });
});
