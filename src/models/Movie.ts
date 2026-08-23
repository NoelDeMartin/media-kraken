import { parseDate } from '@noeldemartin/utils';

import type { TMDBMovie } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

import Model from './Movie.schema';
import type WatchAction from './WatchAction';

export default class Movie extends Model {
    public static cloud = true;

    static fromTMDB(movie: TMDBMovie, options: { posterSize?: 'small' | 'large'; mintUrl?: boolean } = {}): Movie {
        const instance = new Movie({
            title: movie.title,
            description: movie.overview ?? undefined,
            releaseDate: parseDate(movie.release_date) ?? undefined,
            posterUrl: TMDB.moviePosterUrl(movie, options.posterSize),
            externalUrls: [TMDB.movieUrl(movie)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get releaseYear(): number | undefined {
        return this.releaseDate ? this.releaseDate.getFullYear() : undefined;
    }

    public get watched(): boolean {
        return !!this.actions && this.actions.length > 0;
    }

    public async watch(date?: Date): Promise<WatchAction> {
        date = date || new Date();

        return this.relatedActions.create({ startTime: date, endTime: date });
    }
}

(globalThis as Record<string, unknown>).Movie = Movie;
