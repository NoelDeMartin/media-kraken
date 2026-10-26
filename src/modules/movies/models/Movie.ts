import { arrayFilter, arraySorted, isTruthy, parseDate, stringToSlug } from '@noeldemartin/utils';
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
        await super.loadAllRelationsIfUnloaded();
        await this.loadRelationIfUnloaded('watchActions');
        await this.loadRelationIfUnloaded('directors');
    }

    public async deleteWithRelations(): Promise<void> {
        await this.loadAllRelationsIfUnloaded();

        const documentModels = arrayFilter([
            ...(this.cast ?? []).flatMap((role) => [role.actor, role]),
            ...(this.directors ?? []),
            ...(this.watchActions ?? []),
            this.review?.rating,
            this.review,
        ]);

        for (const model of documentModels) {
            await model.delete();
        }

        await this.delete();
    }
}
