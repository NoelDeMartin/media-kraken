import { parseDate, stringToSlug, tap } from '@noeldemartin/utils';
import type { HasOneRelation } from 'soukai-bis';

import type { TMDBShow } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

import Model from './Show.schema';
import ShowWatching, { SHOW_WATCHING_STATUSES } from './ShowWatching';
import type { ShowWatchingStatus } from './ShowWatching';

export default class Show extends Model {
    public static cloud = true;

    declare public readonly watching?: ShowWatching;
    declare public readonly relatedWatching: HasOneRelation<this, ShowWatching, typeof ShowWatching>;

    static fromTMDB(show: TMDBShow, options: { posterSize?: 'small' | 'large'; mintUrl?: boolean } = {}): Show {
        const instance = new Show({
            name: show.name,
            description: show.overview,
            startDate: parseDate(show.first_air_date) ?? undefined,
            posterUrl: TMDB.posterUrl(show, options.posterSize),
            externalUrls: [TMDB.showUrl(show)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get slug(): string {
        return this.requireSlug();
    }

    public get releaseYear(): number | null {
        return this.startDate ? this.startDate.getFullYear() : null;
    }

    public get watchingStatus(): ShowWatchingStatus {
        return this.watching?.status ?? 'pending';
    }

    public getSlug(): string | null {
        if (!this.name) {
            return null;
        }

        if (!this.startDate) {
            return stringToSlug(this.name);
        }

        return `${stringToSlug(this.name)}-${this.startDate.getFullYear()}`;
    }

    public async updateWatchingStatus(status: ShowWatchingStatus): Promise<void> {
        if (this.watchingStatus === status) {
            return;
        }

        const watching = tap(
            this.watching ?? this.relatedWatching.attach({}),
            (related) => (related.statusUrl = SHOW_WATCHING_STATUSES[status]),
        );

        await this.relatedWatching.save(watching);
    }
}
