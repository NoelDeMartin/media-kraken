import { invert } from '@noeldemartin/utils';

import Model from './WatchAction.schema';

export const MOVIE_WATCHING_STATUSES = {
    watched: 'https://schema.org/CompletedActionStatus',
    dropped: 'https://schema.org/FailedActionStatus',
    pending: 'https://schema.org/PotentialActionStatus',
};

export const MOVIE_WATCHING_STATUSES_MAP = invert(MOVIE_WATCHING_STATUSES) as Record<string, MovieWatchingStatus>;

export type MovieWatchingStatus = keyof typeof MOVIE_WATCHING_STATUSES;

export default class WatchAction extends Model {
    public get status(): MovieWatchingStatus {
        return this.statusUrl ? (MOVIE_WATCHING_STATUSES_MAP[this.statusUrl] ?? 'pending') : 'watched';
    }
}
