import { describe, expect, it } from 'vitest';

import Show from '@/models/Show';

describe('Show model', () => {
    function show(externalUrls: string[]): Show {
        return new Show({ name: 'Test Show', externalUrls });
    }

    it('Parses TMDB urls', () => {
        expect(show(['https://www.themoviedb.org/tv/1396']).tmdbId).toBe(1396);
        expect(show(['https://www.themoviedb.org/tv/1396/']).tmdbId).toBe(1396);
        expect(show(['https://www.themoviedb.org/tv/1396-breaking-bad']).tmdbId).toBe(1396);
        expect(show(['https://www.themoviedb.org/movie/550-fight-club']).tmdbId).toBeNull();
        expect(show(['https://www.imdb.com/title/tt0903747/']).tmdbId).toBeNull();
        expect(show(['https://www.themoviedb.org/movie/550']).tmdbId).toBeNull();
        expect(show([]).tmdbId).toBeNull();
    });

    it('Parses IMDb urls', () => {
        expect(show(['https://www.imdb.com/title/tt0903747']).imdbId).toBe('tt0903747');
        expect(show(['https://www.imdb.com/title/tt0903747/']).imdbId).toBe('tt0903747');
        expect(show(['https://www.imdb.com/title/tt0903747?ref_=nv_sr_srsg_0']).imdbId).toBe('tt0903747');
        expect(show(['https://www.imdb.com/title/tt0903747#episodes']).imdbId).toBe('tt0903747');
        expect(show([]).imdbId).toBeNull();
    });

    it('Parses both TMDB and IMDb urls', () => {
        const instance = show(['https://www.themoviedb.org/tv/1396', 'https://www.imdb.com/title/tt0903747/']);

        expect(instance.tmdbId).toBe(1396);
        expect(instance.imdbId).toBe('tt0903747');
    });
});
