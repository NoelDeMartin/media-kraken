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

    it('Creates movie from JSON-LD', async () => {
        const json = {
            '@context': {
                '@vocab': 'https://schema.org/',
                purl: 'http://purl.org/dc/terms/',
                actions: { '@reverse': 'object' },
            },
            '@type': 'Movie',
            name: 'Symbol',
            description: 'A Japanese man...',
            datePublished: {
                '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                '@value': '2009-09-12T00:00:00.000Z',
            },
            sameAs: ['https://www.themoviedb.org/movie/42430'],
            image: 'https://image.tmdb.org/t/p/w500/3hWWrQ86GJMb0JQEY6JhHPnveW4.jpg',
            '@id': 'browser-storage://movies/symbol-2009',
            actions: [
                {
                    '@type': 'WatchAction',
                    startTime: {
                        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                        '@value': '2020-07-03T11:30:09.635Z',
                    },
                    endTime: {
                        '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                        '@value': '2020-07-03T11:30:09.635Z',
                    },
                    '@id': 'browser-storage://movies/symbol-2009#0092a1ed-8b4f-40bc-9674-0869c79a3d69',
                },
            ],
        };

        const instance = await Movie.createFromJsonLD(json);

        expect(instance).not.toBeNull();
        if (!instance) {
            return;
        }

        expect(instance.title).toBe('Symbol');
        expect(instance.description).toBe('A Japanese man...');
        expect(instance.posterUrl).toBe('https://image.tmdb.org/t/p/w500/3hWWrQ86GJMb0JQEY6JhHPnveW4.jpg');
        expect(instance.externalUrls).toEqual(['https://www.themoviedb.org/movie/42430']);
        expect(instance.releaseDate).toBeInstanceOf(Date);
        expect(instance.watchActions).toBeDefined();
        expect(instance.watchActions?.length).toBe(1);
        expect(instance.watched).toBe(true);
    });
});
