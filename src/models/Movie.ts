import { arraySorted, isTruthy, parseDate, stringToSlug } from '@noeldemartin/utils';
import type { BelongsToManyRelation, HasManyRelation } from 'soukai-bis';

import { countryCodeFromUrl } from '@/lib/countries';
import { findExternalId, parseImdbId, parseTmdbId } from '@/lib/domains';
import { isoDurationToMinutes } from '@/lib/durations';
import type { TMDBMovie } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

import Model from './Movie.schema';
import type Person from './Person';
import type WatchAction from './WatchAction';

export default class Movie extends Model {
    public static cloud = true;

    declare public readonly watchActions?: WatchAction[];
    declare public readonly relatedWatchActions: HasManyRelation<this, WatchAction, typeof WatchAction>;
    declare public readonly actors?: Person[];
    declare public readonly relatedActors: BelongsToManyRelation<this, Person, typeof Person>;
    declare public readonly directors?: Person[];
    declare public readonly relatedDirectors: BelongsToManyRelation<this, Person, typeof Person>;

    static fromTMDB(movie: TMDBMovie, options: { posterSize?: 'small' | 'large'; mintUrl?: boolean } = {}): Movie {
        const instance = new Movie({
            title: movie.title,
            description: movie.overview,
            releaseDate: parseDate(movie.release_date) ?? undefined,
            posterUrl: TMDB.posterUrl(movie, options.posterSize),
            externalUrls: [TMDB.movieUrl(movie)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get tmdbId(): number | null {
        return findExternalId('https://www.themoviedb.org/movie/', this.externalUrls, parseTmdbId);
    }

    public get imdbId(): string | null {
        return findExternalId('https://www.imdb.com/title/', this.externalUrls, parseImdbId);
    }

    public get slug(): string {
        return this.requireSlug();
    }

    public get releaseYear(): number | null {
        return this.releaseDate ? this.releaseDate.getFullYear() : null;
    }

    public get genreIds(): number[] {
        return this.genreUrls
            .map((url) => findExternalId('https://www.themoviedb.org/genre/', [url], parseTmdbId))
            .filter(isTruthy);
    }

    public get runtimeMinutes(): number | null {
        return this.duration ? isoDurationToMinutes(this.duration) : null;
    }

    public get countryCodes(): string[] {
        return this.countryUrls.map(countryCodeFromUrl).filter(isTruthy);
    }

    public get watched(): boolean | null {
        return this.watchActions ? this.watchActions.length > 0 : null;
    }

    public get watchedAt(): Date | null {
        const watchActions = this.watchActions?.filter((action) => action.endTime) ?? [];
        const [firstWatch] = arraySorted(watchActions, 'endTime', 'asc');

        return firstWatch?.endTime ?? null;
    }

    public getSlug(): string | null {
        if (!this.title) {
            return null;
        }

        if (!this.releaseDate) {
            return stringToSlug(this.title);
        }

        return `${stringToSlug(this.title)}-${this.releaseDate.getFullYear()}`;
    }

    public async watch(date?: Date): Promise<void> {
        if (this.watched) {
            return;
        }

        await this.loadRelationIfUnloaded('watchActions');
        await this.relatedWatchActions.create({ endTime: date ?? new Date() });
    }

    public async unwatch(): Promise<void> {
        if (!this.watched) {
            return;
        }

        const watchActions = await this.loadRelationIfUnloaded<WatchAction[]>('watchActions');

        await this.relatedWatchActions.delete(watchActions);
    }

    public async loadAllRelationsIfUnloaded(): Promise<void> {
        await this.loadRelationIfUnloaded('watchActions');
        await this.loadRelationIfUnloaded('actors');
        await this.loadRelationIfUnloaded('directors');
    }
}
