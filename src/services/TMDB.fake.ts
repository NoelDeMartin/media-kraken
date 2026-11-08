import { arrayUnique, facade } from '@noeldemartin/utils';
import type { z } from 'zod';

import movies from '@/lib/fixtures/tmdb/movies.json';
import shows from '@/lib/fixtures/tmdb/shows.json';

import { TMDBService } from './TMDB';

type Fixture = {
    id: number;
    title?: string;
    name?: string;
    imdb_id?: string | null;
    genres?: { id: number; name: string }[];
    external_ids?: { imdb_id: string | null };
    seasons?: { season_number: number }[];
};

const MOVIES = movies as unknown as Fixture[];
const SHOWS = shows as unknown as Fixture[];

export class FakeTMDBService extends TMDBService {
    protected override async request<T extends z.ZodType>(
        schema: T,
        path: string,
        parameters: Record<string, string | number> = {},
    ): Promise<z.infer<T>> {
        return schema.parse(this.respond(path, parameters));
    }

    private respond(path: string, parameters: Record<string, string | number>): unknown {
        const [resource, id, subresource, seasonNumber] = path.split('/');

        switch (resource) {
            case 'search':
                return this.searchFixtures(String(parameters.query), String(parameters.type));
            case 'find':
                return {
                    movie_results: MOVIES.filter((movie) => movie.imdb_id === id),
                    tv_results: SHOWS.filter((show) => show.external_ids?.imdb_id === id),
                    person_results: [],
                };
            case 'genre':
                return {
                    genres: arrayUnique(
                        (id === 'movie' ? MOVIES : SHOWS).flatMap((media) => media.genres ?? []),
                        (genre) => String(genre.id),
                    ),
                };
            case 'movie':
                return this.find(MOVIES, id);
            case 'tv': {
                const show = this.find(SHOWS, id);

                if (subresource === 'external_ids') {
                    return show.external_ids ?? { imdb_id: null };
                }

                if (subresource === 'season') {
                    return show.seasons?.find((season) => season.season_number === Number(seasonNumber));
                }

                return show;
            }
        }

        throw new Error(`Fake TMDB request not implemented: ${path}`);
    }

    private searchFixtures(query: string, types: string): unknown {
        const matches = (name?: string) => !!name?.toLowerCase().includes(query.toLowerCase());
        const results = [
            ...(types.includes('movie') ? MOVIES : [])
                .filter((movie) => matches(movie.title))
                .map((movie) => ({ ...movie, media_type: 'movie' })),
            ...(types.includes('tv') ? SHOWS : [])
                .filter((show) => matches(show.name))
                .map((show) => ({ ...show, media_type: 'tv' })),
        ];

        return { page: 1, total_pages: 1, total_results: results.length, results };
    }

    private find(fixtures: Fixture[], id?: string): Fixture {
        const fixture = fixtures.find((media) => media.id === Number(id));

        if (!fixture) {
            throw new Error(`TMDB fixture not found: ${id}`);
        }

        return fixture;
    }
}

export default facade(FakeTMDBService);
