import { DAY_MILLISECONDS } from '@noeldemartin/utils';
import type { MintUrlOptions } from 'soukai-bis';

import { NOW } from '@/lib/time';

import Model from './Episode.schema';

const UPCOMING_THRESHOLD = NOW + 7 * DAY_MILLISECONDS;

export default class Episode extends Model {
    public static isUpcoming(date: Date): boolean {
        return date.getTime() < UPCOMING_THRESHOLD;
    }

    public static isReleased(date: Date): boolean {
        return date.getTime() < NOW;
    }

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
