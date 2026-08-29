import { DAY_MILLISECONDS } from '@noeldemartin/utils';
import type { HasOneRelation, MintUrlOptions } from 'soukai-bis';

import { NOW } from '@/lib/time';
import type EpisodeWatched from '@/models/EpisodeWatched';
import type Season from '@/models/Season';

import Model from './Episode.schema';

const UPCOMING_THRESHOLD = NOW + 7 * DAY_MILLISECONDS;

export default class Episode extends Model {
    public static isUpcoming(date: Date) {
        return date.getTime() < UPCOMING_THRESHOLD;
    }

    public static isReleased(date: Date) {
        return date.getTime() < NOW;
    }

    declare public readonly watched?: EpisodeWatched;
    declare public readonly relatedWatched: HasOneRelation<this, EpisodeWatched, typeof EpisodeWatched>;
    declare public readonly season?: Season;
    declare public readonly relatedSeason: HasOneRelation<this, Season, typeof Season>;

    public async watch(): Promise<void> {
        await this.loadRelationIfUnloaded('watched');

        if (this.watched) {
            return;
        }

        await this.relatedWatched.save(this.relatedWatched.attach({ date: new Date() }));
    }

    public async unwatch(): Promise<void> {
        const watched = await this.loadRelationIfUnloaded('watched');

        if (!watched) {
            return;
        }

        await this.relatedWatched.delete();
    }

    protected newUrlDocumentUrl(options: MintUrlOptions = {}): string {
        if (!this.season?.getContainerUrl()) {
            return super.newUrlDocumentUrl(options);
        }

        return `${this.season.requireContainerUrl()}season-${this.season.number}/episode-${this.number}`;
    }
}
