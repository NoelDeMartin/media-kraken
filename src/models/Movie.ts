import { arraySorted, isTruthy, parseDate, stringToSlug } from '@noeldemartin/utils';
import { InvalidationStrategies, isLocalUrl, loaded } from 'soukai-bis';
import type { BelongsToManyRelation, ComputedAttribute, HasManyRelation } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import { countryCodeFromUrl } from '@/lib/countries';
import { findExternalId } from '@/lib/domains';
import { isoDurationToMinutes } from '@/lib/durations';
import { parseImdbId } from '@/lib/imdb';
import { parseTmdbId, tmdbMovieUrl, tmdbPosterUrl } from '@/lib/tmdb';
import type { TMDBImageSize } from '@/lib/tmdb';
import type { TMDBMovie } from '@/services/TMDB';

import Model from './Movie.schema';
import type PerformanceRole from './PerformanceRole';
import type Person from './Person';
import type WatchAction from './WatchAction';

export type MovieCredit = Pick<Person, 'tmdbId' | 'name'>;

export type MovieCredits = {
    directors: MovieCredit[];
    cast: MovieCredit[];
};

function movieCredit(person: Person): MovieCredit {
    return { tmdbId: person.tmdbId, name: person.name };
}

export default class Movie extends Model {
    public static cloud = true;

    public static computed = {
        credits: {
            invalidationStrategy: InvalidationStrategies.DOCUMENT,
            compute(movie: Movie): MovieCredits {
                return {
                    directors: loaded(movie, 'directors').map(movieCredit),
                    cast: loaded(movie, 'cast')
                        .map((role) => loaded(role, 'actor'))
                        .filter(isTruthy)
                        .map(movieCredit),
                };
            },
        },
    };

    declare public readonly credits: ComputedAttribute<MovieCredits>;
    declare public readonly watchActions?: WatchAction[];
    declare public readonly relatedWatchActions: HasManyRelation<this, WatchAction, typeof WatchAction>;
    declare public readonly cast?: PerformanceRole[];
    declare public readonly relatedCast: BelongsToManyRelation<this, PerformanceRole, typeof PerformanceRole>;
    declare public readonly directors?: Person[];
    declare public readonly relatedDirectors: BelongsToManyRelation<this, Person, typeof Person>;

    static fromTMDB(movie: TMDBMovie, options: { posterSize?: TMDBImageSize; mintUrl?: boolean } = {}): Movie {
        const instance = new Movie({
            title: movie.title,
            description: movie.overview,
            releaseDate: parseDate(movie.release_date) ?? undefined,
            posterUrl: tmdbPosterUrl(movie.poster_path, options.posterSize),
            externalUrls: [tmdbMovieUrl(movie.id)],
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

    public get route(): RouteLocationRaw {
        return {
            name: 'movies.show',
            params: { movie: this.slug },
            query: this.url && !isLocalUrl(this.url) ? { url: this.url } : undefined,
        };
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
        await this.loadRelationIfUnloaded('cast');
        await this.loadRelationIfUnloaded('directors');
    }
}
