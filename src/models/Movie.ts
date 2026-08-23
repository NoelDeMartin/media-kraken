import { parseDate } from '@noeldemartin/utils';

import type { TMDBMovie } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

import Model from './Movie.schema';

export default class Movie extends Model {
    public static cloud = true;

    static fromTMDB(movie: TMDBMovie, options: { posterSize?: 'small' | 'large'; mintUrl?: boolean } = {}): Movie {
        const instance = new Movie({
            title: movie.title,
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
}
