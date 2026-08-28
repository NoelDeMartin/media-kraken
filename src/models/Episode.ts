import { DAY_MILLISECONDS } from '@noeldemartin/utils';
import type { HasOneRelation, MintUrlOptions } from 'soukai-bis';

import type EpisodeWatched from '@/models/EpisodeWatched';
import type Season from '@/models/Season';

import Model from './Episode.schema';

const UPCOMING_THRESHOLD = Date.now() + DAY_MILLISECONDS;

export default class Episode extends Model {
    public static isUpcoming(date: Date) {
        return date.getTime() < UPCOMING_THRESHOLD;
    }

    declare public readonly watched?: EpisodeWatched;
    declare public readonly relatedWatched: HasOneRelation<this, EpisodeWatched, typeof EpisodeWatched>;
    declare public readonly season?: Season;
    declare public readonly relatedSeason: HasOneRelation<this, Season, typeof Season>;

    protected newUrlDocumentUrl(options: MintUrlOptions = {}): string {
        if (!this.season?.getContainerUrl()) {
            return super.newUrlDocumentUrl(options);
        }

        return `${this.season.requireContainerUrl()}season-${this.season.number}/episode-${this.number}`;
    }
}
