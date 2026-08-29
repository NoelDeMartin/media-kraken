import { Service, env } from '@aerogel/core';
import { facade } from '@noeldemartin/utils';
import { z } from 'zod';

const TMDBMovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    overview: z.string().optional(),
    release_date: z.string().optional(),
    poster_path: z.string().nullable(),
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

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>;
export type TMDBShow = z.infer<typeof TMDBShowSchema>;
export type TMDBSeason = z.infer<typeof TMDBSeasonSchema>;
export type TMDBEpisode = z.infer<typeof TMDBEpisodeSchema>;
export type TMDBShowDetails = z.infer<typeof TMDBShowDetailsSchema>;
export type TMDBShowExternalIds = z.infer<typeof TMDBShowExternalIdsSchema>;
export type TMDBSearchResult = z.infer<typeof SearchMovieResultSchema> | z.infer<typeof SearchShowResultSchema>;

type TMDBSeasonDetails = z.infer<typeof TMDBSeasonDetailsSchema>;

export class TMDBService extends Service {
    public movieUrl(movie: TMDBMovie): string {
        return `https://www.themoviedb.org/movie/${movie.id}`;
    }

    public showUrl(show: TMDBShow): string {
        return `https://www.themoviedb.org/tv/${show.id}`;
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

    public async search(query: string): Promise<TMDBSearchResult[]> {
        if (query.length === 0) {
            return [];
        }

        const types = ['movie', 'tv'];
        const response = await this.request(SearchMultiResponseSchema, 'search/multi', {
            query,
            type: types.join(','),
        });

        return response.results.filter((result): result is TMDBSearchResult => types.includes(result.media_type));
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

    private async request<T extends z.ZodType>(
        schema: T,
        path: string,
        parameters: Record<string, string | number> = {},
    ): Promise<z.infer<T>> {
        const url = new URL(`https://api.themoviedb.org/3/${path}`);

        Object.entries({
            api_key: env('VITE_TMDB_API_KEY'),
            language: 'en-US',
        }).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        Object.entries(parameters).forEach(([key, value]) => {
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
