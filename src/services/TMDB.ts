import { Lang, env } from '@aerogel/core';
import { facade, objectFromEntries } from '@noeldemartin/utils';
import { watch } from 'vue';
import { z } from 'zod';

import Service from './TMDB.state';

const TMDBMovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    overview: z.string().optional(),
    release_date: z.string().optional(),
    poster_path: z.string().nullable(),
});

const TMDBGenreSchema = z.object({
    id: z.number(),
    name: z.string(),
});

const TMDBGenreListSchema = z.object({
    genres: z.array(TMDBGenreSchema),
});

const TMDBCastMemberSchema = z.object({
    id: z.number(),
    name: z.string(),
    order: z.number(),
});

const TMDBCrewMemberSchema = z.object({
    id: z.number(),
    name: z.string(),
    job: z.string(),
});

const TMDBCreditsSchema = z
    .object({
        cast: z
            .array(TMDBCastMemberSchema)
            .nullish()
            .transform((val) => val ?? []),
        crew: z
            .array(TMDBCrewMemberSchema)
            .nullish()
            .transform((val) => val ?? []),
    })
    .nullish();

const TMDBMovieDetailsSchema = TMDBMovieSchema.extend({
    imdb_id: z.string().nullable().optional(),
    genres: z.array(TMDBGenreSchema).default([]),
    credits: TMDBCreditsSchema,
    runtime: z.number().nullable().optional(),
    origin_country: z.array(z.string()).default([]),
    production_countries: z
        .array(
            z.object({
                iso_3166_1: z.string(),
            }),
        )
        .default([]),
    spoken_languages: z
        .array(
            z.object({
                iso_639_1: z.string(),
            }),
        )
        .default([]),
});

const TMDBShowSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string().optional(),
    first_air_date: z.string().optional(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
});

const TMDBShowExternalIdsSchema = z.object({
    imdb_id: z.string().nullable().optional(),
});

const TMDBSeasonSchema = z.object({
    id: z.number(),
    name: z.string(),
    season_number: z.number(),
    episode_count: z.number().optional(),
    overview: z.string().optional(),
    air_date: z.string().nullable(),
});

const TMDBEpisodeSchema = z.object({
    id: z.number(),
    name: z.string(),
    episode_number: z.number(),
    season_number: z.number(),
    overview: z.string().optional(),
    air_date: z.string().nullable(),
    runtime: z.number().nullable(),
});

const TMDBShowDetailsSchema = TMDBShowSchema.extend({
    seasons: z.array(TMDBSeasonSchema),
});

const TMDBSeasonDetailsSchema = TMDBSeasonSchema.extend({ episodes: z.array(TMDBEpisodeSchema) });

const SearchMovieResultSchema = TMDBMovieSchema.extend({
    media_type: z.literal('movie'),
});

const SearchShowResultSchema = TMDBShowSchema.extend({
    media_type: z.literal('tv'),
});

const SearchMultiResponseSchema = z.object({
    page: z.number(),
    total_results: z.number(),
    total_pages: z.number(),
    results: z.array(
        z.discriminatedUnion('media_type', [
            SearchMovieResultSchema,
            SearchShowResultSchema,
            z.looseObject({ media_type: z.literal('person') }),
        ]),
    ),
});

const FindResponseSchema = z.object({
    movie_results: z.array(TMDBMovieSchema),
    tv_results: z.array(TMDBShowSchema),
    person_results: z.array(z.looseObject({})),
});

export interface TMDBPerson {
    id: number;
    name: string;
}

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>;
export type TMDBMovieDetails = z.infer<typeof TMDBMovieDetailsSchema>;
export type TMDBGenre = z.infer<typeof TMDBGenreSchema>;
export type TMDBGenreList = z.infer<typeof TMDBGenreListSchema>;
export type TMDBCastMember = z.infer<typeof TMDBCastMemberSchema>;
export type TMDBCrewMember = z.infer<typeof TMDBCrewMemberSchema>;
export type TMDBShow = z.infer<typeof TMDBShowSchema>;
export type TMDBSeason = z.infer<typeof TMDBSeasonSchema>;
export type TMDBEpisode = z.infer<typeof TMDBEpisodeSchema>;
export type TMDBShowDetails = z.infer<typeof TMDBShowDetailsSchema>;
export type TMDBShowExternalIds = z.infer<typeof TMDBShowExternalIdsSchema>;
export type TMDBMovieSearchResult = z.infer<typeof SearchMovieResultSchema>;
export type TMDBShowSearchResult = z.infer<typeof SearchShowResultSchema>;
export type TMDBSearchResult = TMDBMovieSearchResult | TMDBShowSearchResult;
export type TMDBSeasonDetails = z.infer<typeof TMDBSeasonDetailsSchema>;
export type TMDBMovieWithStaff = Omit<TMDBMovieDetails, 'credits'> & { cast: TMDBPerson[]; directors: TMDBPerson[] };

export class TMDBService extends Service {
    public movieUrl(movie: TMDBMovie): string {
        return `https://www.themoviedb.org/movie/${movie.id}`;
    }

    public showUrl(show: TMDBShow): string {
        return `https://www.themoviedb.org/tv/${show.id}`;
    }

    public personUrl(person: TMDBPerson): string {
        return `https://www.themoviedb.org/person/${person.id}`;
    }

    public genreUrl(genre: TMDBGenre): string {
        return `https://www.themoviedb.org/genre/${genre.id}`;
    }

    public posterUrl(media: TMDBMovie | TMDBShow, size: 'small' | 'large' = 'large'): string | undefined {
        return media.poster_path
            ? `https://image.tmdb.org/t/p/${this.getSizeShorthand(size)}${media.poster_path}`
            : undefined;
    }

    public backdropUrl(media: TMDBShow, size: 'small' | 'large' = 'large'): string | undefined {
        return media.backdrop_path
            ? `https://image.tmdb.org/t/p/${this.getSizeShorthand(size)}${media.backdrop_path}`
            : undefined;
    }

    public async search(query: string, options: { types?: 'movie' | 'tv' } = {}): Promise<TMDBSearchResult[]> {
        if (query.length === 0) {
            return [];
        }

        const types = options.types ? [options.types] : ['movie', 'tv'];
        const response = await this.request(SearchMultiResponseSchema, 'search/multi', {
            query,
            type: types.join(','),
        });

        return response.results.filter((result): result is TMDBSearchResult => types.includes(result.media_type));
    }

    public async findByImdbId(imdbId: string): Promise<{ movie: TMDBMovie | null; show: TMDBShow | null }> {
        const response = await this.request(FindResponseSchema, `find/${imdbId}`, {
            external_source: 'imdb_id',
        });

        return {
            movie: response.movie_results[0] ?? null,
            show: response.tv_results[0] ?? null,
        };
    }

    public async getMovie(id: number): Promise<TMDBMovieWithStaff> {
        const { credits, ...details } = await this.request(TMDBMovieDetailsSchema, `movie/${id}`, {
            append_to_response: 'credits',
        });

        return {
            ...details,
            cast:
                credits?.cast
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .slice(0, 6)
                    .map(({ id, name }) => ({ id, name })) ?? [],
            directors:
                credits?.crew
                    .filter((crewMember) => crewMember.job === 'Director')
                    .map(({ id, name }) => ({ id, name })) ?? [],
        };
    }

    public async getShow(
        id: number,
        options: { includeSeasons: boolean },
    ): Promise<{
        details: TMDBShowDetails;
        externalIds: TMDBShowExternalIds;
        seasons: { season: TMDBShowDetails['seasons'][number]; details: TMDBSeasonDetails }[];
    }> {
        const [details, externalIds] = await Promise.all([this.getShowDetails(id), this.getShowExternalIds(id)]);
        const seasons = options.includeSeasons
            ? await Promise.all(
                  details.seasons.map(async (season) => ({
                      season,
                      details: await this.getSeasonDetails(details.id, season.season_number),
                  })),
              )
            : [];

        return { details, externalIds, seasons };
    }

    protected override async boot(): Promise<void> {
        await this.watchGenres();
    }

    private async getShowDetails(id: number): Promise<TMDBShowDetails> {
        return this.request(TMDBShowDetailsSchema, `tv/${id}`);
    }

    private async getShowExternalIds(id: number): Promise<TMDBShowExternalIds> {
        return this.request(TMDBShowExternalIdsSchema, `tv/${id}/external_ids`);
    }

    private async getSeasonDetails(showId: number, seasonNumber: number): Promise<TMDBSeasonDetails> {
        return this.request(TMDBSeasonDetailsSchema, `tv/${showId}/season/${seasonNumber}`);
    }

    private getSizeShorthand(size: 'small' | 'large'): string {
        return size === 'small' ? 'w92' : 'w500';
    }

    private async getMovieGenres(language: string): Promise<TMDBGenre[]> {
        const { genres } = await this.request(TMDBGenreListSchema, 'genre/movie/list', { language });

        return genres;
    }

    private async watchGenres(): Promise<void> {
        await Lang.booted;
        watch(
            () => Lang.locale,
            async () => {
                if (!Lang.locale || Lang.locale in this.genreTranslations) {
                    return;
                }

                const genres = await this.getMovieGenres(Lang.locale);

                this.genreTranslations = {
                    ...this.genreTranslations,
                    [Lang.locale]: objectFromEntries(genres.map((genre) => [genre.id, genre.name])),
                };
            },
            { immediate: true },
        );
    }

    private async request<T extends z.ZodType>(
        schema: T,
        path: string,
        parameters: Record<string, string | number> = {},
    ): Promise<z.infer<T>> {
        const url = new URL(`https://api.themoviedb.org/3/${path}`);
        const searchParams: Record<string, string | number> = {
            api_key: env('VITE_TMDB_API_KEY'),
            language: 'en-US',
            ...parameters,
        };

        Object.entries(searchParams).forEach(([key, value]) => {
            url.searchParams.append(key, String(value));
        });

        const response = await fetch(url.href);

        if (!response.ok) {
            throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return schema.parse(data);
    }
}

export default facade(TMDBService);
