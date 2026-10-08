import { describe, expect, it } from 'vite-plus/test';

import PerformanceRole from '@/models/PerformanceRole';
import Person from '@/models/Person';
import Season from '@/models/Season';
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

    it('Parses genre ids from genre urls', () => {
        const instance = new Show({
            name: 'Test Show',
            genreUrls: ['https://www.themoviedb.org/genre/18', 'https://www.themoviedb.org/genre/80'],
        });

        expect(instance.genreIds).toEqual([18, 80]);
    });

    it('Parses country codes from country urls', () => {
        const instance = new Show({
            name: 'Test Show',
            countryUrls: ['http://www.wikidata.org/entity/Q30', 'http://www.wikidata.org/entity/Q145'],
        });

        expect(instance.countryCodes).toEqual(['US', 'GB']);
    });

    it('Computes credits from cast and creators', () => {
        const instance = new Show({ name: 'Test Show' });
        const bryan = Person.fromTMDB({ id: 17419, name: 'Bryan Cranston', profile_path: null }, { mintUrl: true });
        const role = instance.relatedCast.attach(new PerformanceRole({ actorUrl: bryan.requireUrl() }));

        role.relatedActor.attach(bryan);
        instance.relatedCreators.attach(new Person({ name: 'Vince Gilligan' }));

        expect(Show.computed.credits.compute(instance)).toEqual({
            creators: [{ tmdbId: null, name: 'Vince Gilligan' }],
            cast: [{ tmdbId: 17419, name: 'Bryan Cranston' }],
        });
    });

    it('Derives season and episode counts from seasons', () => {
        const instance = new Show({ name: 'Test Show', _numberOfSeasons: 5, _numberOfEpisodes: 50 });

        instance.relatedSeasons.attach(new Season({ number: 0, episodeUrls: ['https://example.com/specials/1'] }));
        instance.relatedSeasons.attach(
            new Season({ number: 1, episodeUrls: ['https://example.com/s1/1', 'https://example.com/s1/2'] }),
        );
        instance.relatedSeasons.attach(new Season({ number: 2, episodeUrls: ['https://example.com/s2/1'] }));

        expect(instance.numberOfSeasons).toBe(2);
        expect(instance.numberOfEpisodes).toBe(3);
    });

    it('Falls back to stored season and episode counts', () => {
        const instance = new Show({ name: 'Test Show', _numberOfSeasons: 5, _numberOfEpisodes: 50 });

        expect(instance.numberOfSeasons).toBe(5);
        expect(instance.numberOfEpisodes).toBe(50);

        instance.relatedSeasons.related = [];

        expect(instance.numberOfSeasons).toBe(5);
        expect(instance.numberOfEpisodes).toBe(50);
    });

    it('Returns null counts without seasons or stored counts', () => {
        const instance = new Show({ name: 'Test Show' });

        expect(instance.numberOfSeasons).toBeNull();
        expect(instance.numberOfEpisodes).toBeNull();
    });
});
