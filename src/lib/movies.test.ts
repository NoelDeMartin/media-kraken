import { describe, expect, it } from 'vitest';

import { type FilterableMovie, hasActiveMovieFilters, movieMatchesFilters } from '@/lib/movies';

function movie(attributes: Partial<FilterableMovie> = {}): FilterableMovie {
    return {
        genreIds: [],
        countryCodes: [],
        languages: [],
        directors: [],
        actors: [],
        releaseYear: null,
        runtimeMinutes: null,
        watched: null,
        ...attributes,
    };
}

describe('movies filter helpers', () => {
    it('detects active filters correctly', () => {
        expect(hasActiveMovieFilters(null)).toBe(false);
        expect(hasActiveMovieFilters({})).toBe(false);
        expect(hasActiveMovieFilters({ genres: null })).toBe(false);
        expect(hasActiveMovieFilters({ genres: [] })).toBe(false);
        expect(hasActiveMovieFilters({ genres: [28] })).toBe(true);
        expect(hasActiveMovieFilters({ directors: [] })).toBe(false);
        expect(hasActiveMovieFilters({ directors: ['David Fincher'] })).toBe(true);
        expect(hasActiveMovieFilters({ watchStatus: 'all' })).toBe(false);
        expect(hasActiveMovieFilters({ watchStatus: 'watched' })).toBe(true);
        expect(hasActiveMovieFilters({ watchStatus: 'unwatched' })).toBe(true);
        expect(hasActiveMovieFilters({ releaseYear: [null, null] })).toBe(false);
        expect(hasActiveMovieFilters({ releaseYear: [2000, null] })).toBe(true);
        expect(hasActiveMovieFilters({ duration: [null, 120] })).toBe(true);
    });

    it('matches movies with any of the selected values', () => {
        const fincher = movie({ directors: [{ name: 'David Fincher' }] });
        const nolan = movie({ directors: [{ name: 'Christopher Nolan' }] });
        const villeneuve = movie({ directors: [{ name: 'Denis Villeneuve' }] });
        const filters = { directors: ['David Fincher', 'Christopher Nolan'] };

        expect(movieMatchesFilters(fincher, filters)).toBe(true);
        expect(movieMatchesFilters(nolan, filters)).toBe(true);
        expect(movieMatchesFilters(villeneuve, filters)).toBe(false);
        expect(movieMatchesFilters(movie({ genreIds: [18, 53] }), { genres: [28, 53] })).toBe(true);
        expect(movieMatchesFilters(movie({ genreIds: [18] }), { genres: [28, 53] })).toBe(false);
    });

    it('matches movies within ranges', () => {
        expect(movieMatchesFilters(movie({ releaseYear: 1999 }), { releaseYear: [1990, 2000] })).toBe(true);
        expect(movieMatchesFilters(movie({ releaseYear: 2001 }), { releaseYear: [1990, 2000] })).toBe(false);
        expect(movieMatchesFilters(movie({ releaseYear: 2020 }), { releaseYear: [1990, null] })).toBe(true);
        expect(movieMatchesFilters(movie({ releaseYear: null }), { releaseYear: [1990, null] })).toBe(false);
        expect(movieMatchesFilters(movie({ runtimeMinutes: 90 }), { duration: [null, 120] })).toBe(true);
        expect(movieMatchesFilters(movie({ runtimeMinutes: 150 }), { duration: [null, 120] })).toBe(false);
        expect(movieMatchesFilters(movie(), { duration: [null, null] })).toBe(true);
    });

    it('matches movies by watch status', () => {
        expect(movieMatchesFilters(movie({ watched: true }), { watchStatus: 'watched' })).toBe(true);
        expect(movieMatchesFilters(movie({ watched: false }), { watchStatus: 'watched' })).toBe(false);
        expect(movieMatchesFilters(movie({ watched: true }), { watchStatus: 'unwatched' })).toBe(false);
        expect(movieMatchesFilters(movie({ watched: true }), { watchStatus: 'all' })).toBe(true);
    });
});
