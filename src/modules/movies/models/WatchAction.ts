import { invert } from '@noeldemartin/utils';
import type { BelongsToOneRelation } from 'soukai-bis';

import type Movie from './Movie';
import Model from './WatchAction.schema';

export const MOVIE_WATCHING_STATUSES = {
    watched: 'https://schema.org/CompletedActionStatus',
    dropped: 'https://schema.org/FailedActionStatus',
    pending: 'https://schema.org/PotentialActionStatus',
};

export const MOVIE_WATCHING_STATUSES_MAP = invert(MOVIE_WATCHING_STATUSES) as Record<string, MovieWatchingStatus>;

export type MovieWatchingStatus = keyof typeof MOVIE_WATCHING_STATUSES;

export default class WatchAction extends Model {
    declare public readonly movie?: Movie;
    declare public readonly relatedMovie: BelongsToOneRelation<this, Movie, typeof Movie>;

    public get status(): MovieWatchingStatus {
        return this.statusUrl ? (MOVIE_WATCHING_STATUSES_MAP[this.statusUrl] ?? 'pending') : 'watched';
    }
}
