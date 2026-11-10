import type { ModelWithUrl } from 'soukai-bis';
import { describe, expect, it, vi } from 'vite-plus/test';

import { tmdbMovieUrl, tmdbPersonUrl, tmdbShowUrl } from '@/lib/tmdb';
import PerformanceRole from '@/models/PerformanceRole';
import Person from '@/models/Person';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

import Catalog from './Catalog';
import TMDB from './TMDB';
import type { TMDBMovieWithStaff, TMDBPerson, TMDBShowWithStaff } from './TMDB';

describe('Catalog service', () => {
    const ripley: TMDBPerson = { id: 10205, name: 'Sigourney Weaver' };

    function tmdbMovie(staff: { cast?: TMDBPerson[]; directors?: TMDBPerson[] }): TMDBMovieWithStaff {
        return {
            id: 348,
            title: 'Alien',
            overview: '',
            poster_path: null,
            release_date: '1979-05-25',
            runtime: 117,
            genres: [],
            keywords: [],
            origin_country: [],
            production_countries: [],
            spoken_languages: [],
            cast: staff.cast?.map((person) => ({ ...person, characters: [] })) ?? [],
            directors: staff.directors ?? [],
        } as unknown as TMDBMovieWithStaff;
    }

    function tmdbShow(staff: { cast?: TMDBPerson[]; creators?: TMDBPerson[] }): TMDBShowWithStaff {
        return {
            id: 1396,
            name: 'Breaking Bad',
            overview: '',
            poster_path: null,
            backdrop_path: null,
            first_air_date: '2008-01-20',
            genres: [],
            keywords: [],
            origin_country: [],
            production_countries: [],
            spoken_languages: [],
            seasons: [],
            cast: staff.cast?.map((person) => ({ ...person, characters: [] })) ?? [],
            creators: staff.creators ?? [],
        } as unknown as TMDBShowWithStaff;
    }

    function mockTMDBShow(details: TMDBShowWithStaff): void {
        vi.spyOn(TMDB.requireInstance(), 'getShow').mockResolvedValue({
            details,
            externalIds: { imdb_id: null },
            seasons: [],
        });
    }

    async function createShowWithSharedPerson(): Promise<{ show: ModelWithUrl<Show>; person: Person }> {
        const show = new Show({ name: 'Breaking Bad', externalUrls: [tmdbShowUrl(1396)] });

        show.mintUrl();

        const person = show.relatedCreators.attach(Person.fromTMDB(ripley), { mintUrl: true });
        const role = show.relatedCast.attach(new PerformanceRole({ actorUrl: person.requireUrl() }), {
            mintUrl: true,
        });

        role.relatedActor.attach(person);

        await show.save();

        const freshShow = await Show.findOrFail(show.requireUrl());

        await freshShow.loadRelation('cast');
        await freshShow.loadRelation('creators');

        return { show: freshShow, person };
    }

    async function createMovieWithSharedPerson(): Promise<{ movie: ModelWithUrl<Movie>; person: Person }> {
        const movie = new Movie({ title: 'Alien', externalUrls: [tmdbMovieUrl(348)] });

        movie.mintUrl();

        const person = movie.relatedDirectors.attach(Person.fromTMDB(ripley), { mintUrl: true });
        const role = movie.relatedCast.attach(new PerformanceRole({ actorUrl: person.requireUrl() }), {
            mintUrl: true,
        });

        role.relatedActor.attach(person);

        await movie.save();

        const freshMovie = await Movie.findOrFail(movie.requireUrl());

        await freshMovie.loadRelation('cast');
        await freshMovie.loadRelation('directors');

        return { movie: freshMovie, person };
    }

    it('Keeps stale actors that are still directors', async () => {
        const { movie, person } = await createMovieWithSharedPerson();

        vi.spyOn(TMDB.requireInstance(), 'getMovie').mockResolvedValue(tmdbMovie({ directors: [ripley] }));

        await Catalog.sync(movie);

        const freshMovie = await Movie.findOrFail(movie.url);

        await freshMovie.loadRelation('cast');
        await freshMovie.loadRelation('directors');

        expect(freshMovie.cast).toHaveLength(0);
        expect(freshMovie.directors?.map((director) => director.url)).toEqual([person.url]);
    });

    it('Keeps stale directors that are still actors', async () => {
        const { movie, person } = await createMovieWithSharedPerson();

        vi.spyOn(TMDB.requireInstance(), 'getMovie').mockResolvedValue(tmdbMovie({ cast: [ripley] }));

        await Catalog.sync(movie);

        const freshMovie = await Movie.findOrFail(movie.url);

        await freshMovie.loadRelation('cast');
        await freshMovie.loadRelation('directors');

        expect(freshMovie.directors).toHaveLength(0);
        expect(freshMovie.cast?.map((role) => role.actor?.url)).toEqual([person.url]);
        expect(freshMovie.cast?.[0]?.actor?.externalUrls).toEqual([tmdbPersonUrl(ripley.id)]);
    });

    it('Deletes stale persons', async () => {
        const { movie, person } = await createMovieWithSharedPerson();

        vi.spyOn(TMDB.requireInstance(), 'getMovie').mockResolvedValue(tmdbMovie({}));

        await Catalog.sync(movie);

        const freshMovie = await Movie.findOrFail(movie.url);

        await freshMovie.loadRelation('cast');
        await freshMovie.loadRelation('directors');

        expect(freshMovie.cast).toHaveLength(0);
        expect(freshMovie.directors).toHaveLength(0);
        expect(await Person.find(person.requireUrl())).toBeNull();
    });

    it('Keeps stale show actors that are still creators', async () => {
        const { show, person } = await createShowWithSharedPerson();

        mockTMDBShow(tmdbShow({ creators: [ripley] }));

        await Catalog.sync(show);

        const freshShow = await Show.findOrFail(show.url);

        await freshShow.loadRelation('cast');
        await freshShow.loadRelation('creators');

        expect(freshShow.cast).toHaveLength(0);
        expect(freshShow.creators?.map((creator) => creator.url)).toEqual([person.url]);
    });

    it('Keeps stale show creators that are still actors', async () => {
        const { show, person } = await createShowWithSharedPerson();

        mockTMDBShow(tmdbShow({ cast: [ripley] }));

        await Catalog.sync(show);

        const freshShow = await Show.findOrFail(show.url);

        await freshShow.loadRelation('cast');
        await freshShow.loadRelation('creators');

        expect(freshShow.creators).toHaveLength(0);
        expect(freshShow.cast?.map((role) => role.actor?.url)).toEqual([person.url]);
    });
});
