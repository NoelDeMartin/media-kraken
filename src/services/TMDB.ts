import { Cache, Events, Lang, env } from '@aerogel/core';
import { facade, objectFromEntries, tap } from '@noeldemartin/utils';
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
    character: z.string().nullish(),
    order: z.number(),
    profile_path: z.string().nullish(),
});

const TMDBCrewMemberSchema = z.object({
    id: z.number(),
    name: z.string(),
    job: z.string(),
    profile_path: z.string().nullish(),
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

const TMDBMediaDetailsSchema = z.object({
    genres: z.array(TMDBGenreSchema).default([]),
    credits: TMDBCreditsSchema,
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

const TMDBMovieDetailsSchema = TMDBMovieSchema.extend(TMDBMediaDetailsSchema.shape).extend({
    imdb_id: z.string().nullable().optional(),
    runtime: z.number().nullable().optional(),
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

const TMDBShowDetailsSchema = TMDBShowSchema.extend(TMDBMediaDetailsSchema.shape).extend({
    seasons: z.array(TMDBSeasonSchema),
    created_by: z
        .array(
            z.object({
                id: z.number(),
                name: z.string(),
                profile_path: z.string().nullish(),
            }),
        )
        .nullish()
        .transform((val) => val ?? []),
    number_of_seasons: z.number().nullish(),
    number_of_episodes: z.number().nullish(),
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
    profile_path?: string | null;
}

export interface TMDBCastCredit extends TMDBPerson {
    characters: string[];
}

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>;
export type TMDBMediaDetails = z.infer<typeof TMDBMediaDetailsSchema>;
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
export type TMDBMediaWithStaff<T extends TMDBMediaDetails = TMDBMediaDetails> = Omit<T, 'credits'> & {
    cast?: TMDBCastCredit[];
};
export type TMDBMovieWithStaff = TMDBMediaWithStaff<TMDBMovieDetails> & {
    directors?: TMDBPerson[];
};
export type TMDBShowWithStaff = Omit<TMDBMediaWithStaff<TMDBShowDetails>, 'created_by'> & {
    creators?: TMDBPerson[];
};
export type TMDBCredits = z.infer<typeof TMDBCreditsSchema>;

export class TMDBService extends Service {
    public translateGenre(id: number): string | null {
        return (Lang.locale && this.genreTranslations[Lang.locale]?.[id]) || null;
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

    public async getMovie(id: number, options: { includeStaff: boolean }): Promise<TMDBMovieWithStaff> {
        const { credits, ...details } = await this.request(
            TMDBMovieDetailsSchema,
            `movie/${id}`,
            options.includeStaff ? { append_to_response: 'credits' } : {},
        );

        if (!options.includeStaff) {
            return details;
        }

        return {
            ...details,
            cast: this.parseCast(credits),
            directors:
                credits?.crew
                    .filter((crewMember) => crewMember.job === 'Director')
                    .map(({ id, name, profile_path }) => ({ id, name, profile_path })) ?? [],
        };
    }

    public async getShow(
        id: number,
        options: { includeSeasons: boolean; includeStaff?: boolean },
    ): Promise<{
        details: TMDBShowWithStaff;
        externalIds: TMDBShowExternalIds;
        seasons: { season: TMDBShowDetails['seasons'][number]; details: TMDBSeasonDetails }[];
    }> {
        const [details, externalIds] = await Promise.all([
            this.getShowDetails(id, { includeStaff: !!options.includeStaff }),
            this.getShowExternalIds(id),
        ]);
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

    public async getShowExternalIds(id: number): Promise<TMDBShowExternalIds> {
        return this.request(TMDBShowExternalIdsSchema, `tv/${id}/external_ids`);
    }

    protected override async boot(): Promise<void> {
        await this.watchGenres();
    }

    private async getShowDetails(id: number, options: { includeStaff: boolean }): Promise<TMDBShowWithStaff> {
        const {
            credits,
            created_by: creators,
            ...details
        } = await this.request(
            TMDBShowDetailsSchema,
            `tv/${id}`,
            options.includeStaff ? { append_to_response: 'credits' } : {},
        );

        if (!options.includeStaff) {
            return details;
        }

        return {
            ...details,
            cast: this.parseCast(credits),
            creators: creators.map(({ id, name, profile_path }) => ({ id, name, profile_path })),
        };
    }

    private async getSeasonDetails(showId: number, seasonNumber: number): Promise<TMDBSeasonDetails> {
        return this.request(TMDBSeasonDetailsSchema, `tv/${showId}/season/${seasonNumber}`);
    }

    private async getGenres(language: string): Promise<TMDBGenre[]> {
        const [movieGenres, showGenres] = await Promise.all([
            this.request(TMDBGenreListSchema, 'genre/movie/list', { language }),
            this.request(TMDBGenreListSchema, 'genre/tv/list', { language }),
        ]);

        return [...movieGenres.genres, ...showGenres.genres];
    }

    private async watchGenres(): Promise<void> {
        await Lang.booted;

        Events.on('clear-cache', async () => {
            this.genreTranslations = {};

            await this.loadGenreTranslations(Lang.locale);
        });

        watch(
            () => Lang.locale,
            (value) => this.loadGenreTranslations(value),
            { immediate: true },
        );
    }

    private async loadGenreTranslations(locale: string): Promise<void> {
        if (!locale || locale in this.genreTranslations) {
            return;
        }

        this.genreTranslations = {
            ...this.genreTranslations,
            [locale]: await this.getLocaleGenreTranslations(locale),
        };
    }

    private async getLocaleGenreTranslations(locale: string): Promise<Record<number, string>> {
        const cacheKey = `tmdb-genres-${locale}`;
        const translations = await Cache.get<Record<number, string>>(cacheKey);

        if (translations) {
            return translations;
        }

        const genres = await this.getGenres(locale);

        return tap(objectFromEntries(genres.map((genre) => [genre.id, genre.name])), async (value) => {
            await Cache.set(cacheKey, value);
        });
    }

    private parseCast(credits: TMDBCredits): TMDBCastCredit[] {
        return (
            credits?.cast
                .slice()
                .sort((a, b) => a.order - b.order)
                .slice(0, 6)
                .map(({ id, name, profile_path, character }) => ({
                    id,
                    name,
                    profile_path,
                    characters:
                        character
                            ?.split(' / ')
                            .map((name) => name.trim())
                            .filter((name) => name.length > 0) ?? [],
                })) ?? []
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
