import { parseDate } from '@noeldemartin/utils';
import type { HasManyRelation } from 'soukai-bis';

import type { TMDBMovie } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

import Model from './Movie.schema';
import type WatchAction from './WatchAction';

export default class Movie extends Model {
    public static cloud = true;

    declare public readonly watchActions?: WatchAction[];
    declare public readonly relatedWatchActions: HasManyRelation<this, WatchAction, typeof WatchAction>;

    static fromTMDB(movie: TMDBMovie, options: { posterSize?: 'small' | 'large'; mintUrl?: boolean } = {}): Movie {
        const instance = new Movie({
            title: movie.title,
            description: movie.overview,
            releaseDate: parseDate(movie.release_date) ?? undefined,
            posterUrl: TMDB.moviePosterUrl(movie, options.posterSize),
            externalUrls: [TMDB.movieUrl(movie)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get releaseYear(): number | null {
        return this.releaseDate ? this.releaseDate.getFullYear() : null;
    }

    public get watched(): boolean | null {
        return this.watchActions ? this.watchActions.length > 0 : null;
    }

    public async watch(): Promise<void> {
        await this.relatedWatchActions.create({ endTime: new Date() });
    }
}
