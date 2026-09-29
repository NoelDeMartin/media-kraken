import { describe, expect, it } from 'vite-plus/test';

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
        const person = Person.fromTMDB({ id: 6384, name: 'Keanu Reeves', profile_path: '/keanu.jpg' });

        expect(person.name).toBe('Keanu Reeves');
        expect(person.imageUrl).toBe('https://image.tmdb.org/t/p/w185/keanu.jpg');
        expect(person.externalUrls).toEqual(['https://www.themoviedb.org/person/6384']);
        expect(person.tmdbId).toBe(6384);
    });
});
