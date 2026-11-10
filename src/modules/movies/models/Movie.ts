import { arraySorted, isTruthy, parseDate, stringToSlug } from '@noeldemartin/utils';
import { InvalidationStrategies, isLocalUrl, loaded } from 'soukai-bis';
import type { BelongsToManyRelation, ComputedAttribute, HasManyRelation } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import { findExternalId } from '@/lib/domains';
import { isoDurationToMinutes } from '@/lib/durations';
import { parseTmdbId, tmdbMovieUrl, tmdbPosterUrl } from '@/lib/tmdb';
import type { TMDBImageSize } from '@/lib/tmdb';
import type Person from '@/models/Person';
import type { PersonCredit } from '@/models/Person';
import type { TMDBMovie } from '@/services/TMDB';

import Model from './Movie.schema';
import type WatchAction from './WatchAction';
import { MOVIE_WATCHING_STATUSES } from './WatchAction';
import type { MovieWatchingStatus } from './WatchAction';

export type MovieCredits = {
    directors: PersonCredit[];
    cast: PersonCredit[];
};

export default class Movie extends Model {
    public static cloud = true;

    public static computed = {
        credits: {
            invalidationStrategy: InvalidationStrategies.DOCUMENT,
            compute(movie: Movie): MovieCredits {
                return {
                    directors: loaded(movie, 'directors').map((director) => director.credit),
                    cast: loaded(movie, 'cast')
                        .map((role) => loaded(role, 'actor'))
                        .filter(isTruthy)
                        .map((actor) => actor.credit),
                };
            },
        },
    };

    declare public readonly credits: ComputedAttribute<MovieCredits>;
    declare public readonly watchActions?: WatchAction[];
    declare public readonly relatedWatchActions: HasManyRelation<this, WatchAction, typeof WatchAction>;
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

    public get releaseYear(): number | null {
        return this.releaseDate ? this.releaseDate.getFullYear() : null;
    }

    public get runtimeMinutes(): number | null {
        return this.duration ? isoDurationToMinutes(this.duration) : null;
    }

    public get watchingStatus(): MovieWatchingStatus {
        return this.watches.length > 0 ? 'watched' : (this.watchAction?.status ?? 'pending');
    }

    public get watches(): WatchAction[] {
        return arraySorted(
            (this.watchActions ?? []).filter((action) => action.status === 'watched'),
            'endTime',
            'asc',
        );
    }

    public get watchCount(): number {
        return this.watches.length;
    }

    public get watchedAt(): Date | null {
        return this.watches.find((watch) => watch.endTime)?.endTime ?? null;
    }

    public get droppedAt(): Date | null {
        return this.watchingStatus === 'dropped' ? (this.watchAction?.endTime ?? null) : null;
    }

    private get watchAction(): WatchAction | null {
        return arraySorted(this.watchActions ?? [], 'endTime', 'asc')[0] ?? null;
    }

    public get route(): RouteLocationRaw {
        return {
            name: 'movies.show',
            params: { movie: this.slug },
            query: this.url && !isLocalUrl(this.url) ? { url: this.url } : undefined,
        };
    }

    public setWatchingStatus(status: MovieWatchingStatus, date?: Date): void {
        this.assertRelationLoaded('watchActions');

        if (this.watchingStatus === status && !date) {
            return;
        }

        const [watchAction, ...staleWatchActions] = arraySorted(this.watchActions ?? [], 'endTime', 'asc');

        this.relatedWatchActions.detach(staleWatchActions, { delete: true });

        (watchAction ?? this.relatedWatchActions.attach({})).setAttributes({
            statusUrl: MOVIE_WATCHING_STATUSES[status],
            endTime: status === 'pending' ? undefined : (date ?? new Date()),
        });
    }

    public addWatch(date: Date = new Date()): void {
        this.assertRelationLoaded('watchActions');

        if (this.watchingStatus !== 'watched') {
            this.setWatchingStatus('watched', date);

            return;
        }

        this.relatedWatchActions.attach({ statusUrl: MOVIE_WATCHING_STATUSES.watched, endTime: date });
    }

    public async rewatch(): Promise<void> {
        await this.loadRelationIfUnloaded('watchActions');

        this.addWatch();

        await this.save();
    }

    public async updateWatchingStatus(status: MovieWatchingStatus, date?: Date): Promise<void> {
        await this.loadRelationIfUnloaded('watchActions');

        this.setWatchingStatus(status, date);

        await this.save();
    }

    public async loadAllRelationsIfUnloaded(): Promise<void> {
        await super.loadAllRelationsIfUnloaded();
        await this.loadRelationIfUnloaded('watchActions');
        await this.loadRelationIfUnloaded('directors');
    }

    protected newUrlSlug(): string | null {
        if (!this.title) {
            return null;
        }

        if (!this.releaseDate) {
            return stringToSlug(this.title);
        }

        return `${stringToSlug(this.title)}-${this.releaseDate.getFullYear()}`;
    }
}
