import { invert } from '@noeldemartin/utils';

import Model from './ShowWatching.schema';

export const SHOW_WATCHING_STATUSES = {
    watching: 'https://schema.org/ActiveActionStatus',
    completed: 'https://schema.org/CompletedActionStatus',
    dropped: 'https://schema.org/FailedActionStatus',
    pending: 'https://schema.org/PotentialActionStatus',
};

export const SHOW_WATCHING_STATUSES_MAP = invert(SHOW_WATCHING_STATUSES) as Record<string, ShowWatchingStatus>;

export type ShowWatchingStatus = keyof typeof SHOW_WATCHING_STATUSES;

export default class ShowWatching extends Model {
    get status(): ShowWatchingStatus {
        return SHOW_WATCHING_STATUSES_MAP[this.statusUrl ?? ''] ?? 'pending';
    }
}
