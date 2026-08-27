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
});

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
export type TMDBSearchResult = z.infer<typeof SearchMovieResultSchema> | z.infer<typeof SearchShowResultSchema>;

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
