import { Service, env } from '@aerogel/core';
import { facade } from '@noeldemartin/utils';
import { z } from 'zod';

const TMDBMovieSchema = z.object({
    id: z.number(),
    title: z.string(),
    release_date: z.string().optional(),
    poster_path: z.string().nullable(),
});

const SearchMoviesResponseSchema = z.object({
    page: z.number(),
    total_results: z.number(),
    total_pages: z.number(),
    results: z.array(TMDBMovieSchema),
});

export type TMDBMovie = z.infer<typeof TMDBMovieSchema>;

export class TMDBService extends Service {
    public movieUrl(movie: TMDBMovie): string {
        return `https://www.themoviedb.org/movie/${movie.id}`;
    }

    public moviePosterUrl(movie: TMDBMovie, size: 'small' | 'large' = 'large'): string | undefined {
        return movie.poster_path
            ? `https://image.tmdb.org/t/p/${this.getSizeShorthand(size)}${movie.poster_path}`
            : undefined;
    }

    public async searchMovies(query: string): Promise<TMDBMovie[]> {
        if (query.length === 0) {
            return [];
        }

        const response = await this.request(SearchMoviesResponseSchema, 'search/movie', { query });

        return response.results;
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
