import { describe, expect, it } from 'vitest';

import Movie from '@/models/Movie';

describe('Movie model', () => {
    function movie(externalUrls: string[]): Movie {
        return new Movie({ title: 'Test Movie', externalUrls });
    }

    it('Parses TMDB urls', () => {
        expect(movie(['https://www.themoviedb.org/movie/550']).tmdbId).toBe(550);
        expect(movie(['https://www.themoviedb.org/movie/550/']).tmdbId).toBe(550);
        expect(movie(['https://www.themoviedb.org/movie/550-fight-club']).tmdbId).toBe(550);
        expect(movie(['https://www.themoviedb.org/tv/1396-breaking-bad']).tmdbId).toBeNull();
        expect(movie(['https://www.imdb.com/title/tt0137523/']).tmdbId).toBeNull();
        expect(movie(['https://www.themoviedb.org/tv/1396']).tmdbId).toBeNull();
        expect(movie([]).tmdbId).toBeNull();
    });

    it('Parses IMDb urls', () => {
        expect(movie(['https://www.imdb.com/title/tt0137523']).imdbId).toBe('tt0137523');
        expect(movie(['https://www.imdb.com/title/tt0137523/']).imdbId).toBe('tt0137523');
        expect(movie(['https://www.imdb.com/title/tt0137523?ref_=nv_sr_srsg_0']).imdbId).toBe('tt0137523');
        expect(movie(['https://www.imdb.com/title/tt0137523#main']).imdbId).toBe('tt0137523');
        expect(movie(['https://www.themoviedb.org/movie/550']).imdbId).toBeNull();
        expect(movie([]).imdbId).toBeNull();
    });

    it('Parses both TMDB and IMDb urls', () => {
        const instance = movie(['https://www.themoviedb.org/movie/550', 'https://www.imdb.com/title/tt0137523/']);

        expect(instance.tmdbId).toBe(550);
        expect(instance.imdbId).toBe('tt0137523');
    });

    it('Parses genre ids from genre urls', () => {
        const instance = new Movie({
            title: 'Test Movie',
            genreUrls: ['https://www.themoviedb.org/genre/28', 'https://www.themoviedb.org/genre/878'],
        });

        expect(instance.genreIds).toEqual([28, 878]);
    });

    it('Parses runtime minutes from duration', () => {
        const withDuration = new Movie({ title: 'Test Movie', duration: 'PT136M' });
        const withoutDuration = new Movie({ title: 'Test Movie' });

        expect(withDuration.runtimeMinutes).toBe(136);
        expect(withoutDuration.runtimeMinutes).toBeNull();
    });

    it('Parses country codes from country urls', () => {
        const instance = new Movie({
            title: 'Test Movie',
            countryUrls: ['http://www.wikidata.org/entity/Q30', 'http://www.wikidata.org/entity/Q145'],
        });

        expect(instance.countryCodes).toEqual(['US', 'GB']);
    });
});
