import { parseDate, stringToSlug } from '@noeldemartin/utils';
import { emitModelInstanceEvent, isLocalUrl } from 'soukai-bis';
import type { BelongsToManyRelation, HasOneRelation } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import { findExternalId } from '@/lib/domains';
import { parseTmdbId, tmdbPosterUrl, tmdbShowUrl } from '@/lib/tmdb';
import type { TMDBImageSize } from '@/lib/tmdb';
import type Person from '@/models/Person';
import type { PersonCredit } from '@/models/Person';
import type { TMDBShow } from '@/services/TMDB';

import type Season from './Season';
import Model from './Show.schema';
import type ShowWatching from './ShowWatching';
import { SHOW_WATCHING_STATUSES } from './ShowWatching';
import type { ShowWatchingStatus } from './ShowWatching';

export type PendingEpisode = {
    url: string;
    seasonNumber: number;
    episodeNumber: number;
    name: string;
    publishedAt: Date;
};

export type WatchedEpisodes = {
    episodes: number;
    seasons: number;
};

export type ShowCredits = {
    creators: PersonCredit[];
    cast: PersonCredit[];
};

export default class Show extends Model {
    public static cloud = { depth: 1 };

    declare public readonly creators?: Person[];
    declare public readonly relatedCreators: BelongsToManyRelation<this, Person, typeof Person>;
    declare public readonly watching?: ShowWatching;
    declare public readonly relatedWatching: HasOneRelation<this, ShowWatching, typeof ShowWatching>;
    declare public readonly seasons?: Season[];
    declare public readonly relatedSeasons: BelongsToManyRelation<this, Season, typeof Season>;

    static fromTMDB(show: TMDBShow, options: { posterSize?: TMDBImageSize; mintUrl?: boolean } = {}): Show {
        const instance = new Show({
            name: show.name,
            description: show.overview,
            startDate: parseDate(show.first_air_date) ?? undefined,
            posterUrl: tmdbPosterUrl(show.poster_path, options.posterSize),
            externalUrls: [tmdbShowUrl(show.id)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get releaseYear(): number | null {
        return this.startDate ? this.startDate.getFullYear() : null;
    }

    public get numberOfSeasons(): number | null {
        const seasons = this.regularSeasons;

        if (!seasons?.length) {
            return this._numberOfSeasons ?? null;
        }

        return seasons.length;
    }

    public get numberOfEpisodes(): number | null {
        const seasons = this.regularSeasons;

        if (!seasons?.length) {
            return this._numberOfEpisodes ?? null;
        }

        return seasons.reduce((total, season) => total + season.episodeUrls.length, 0);
    }

    public get watchingStatus(): ShowWatchingStatus {
        return this.watching?.status ?? 'pending';
    }

    private get regularSeasons(): Season[] | undefined {
        return this.seasons?.filter((season) => season.number !== 0);
    }

    public get tmdbId(): number | null {
        return findExternalId('https://www.themoviedb.org/tv/', this.externalUrls, parseTmdbId);
    }

    public get route(): RouteLocationRaw {
        return {
            name: 'shows.show',
            params: { show: this.slug },
            query: this.url && !isLocalUrl(this.url) ? { url: this.url } : undefined,
        };
    }

    public async loadAllRelationsIfUnloaded(): Promise<void> {
        await super.loadAllRelationsIfUnloaded();
        await this.loadRelationIfUnloaded('watching');
        await this.loadRelationIfUnloaded('creators');
        await this.loadRelationIfUnloaded('seasons');
        await Promise.all(this.seasons?.map((season) => season.loadRelationIfUnloaded('episodes')) ?? []);

        for (const season of this.seasons ?? []) {
            for (const episode of season.episodes ?? []) {
                if (episode.isRelationLoaded('watched')) {
                    continue;
                }

                episode.relatedWatched.related = null;

                await emitModelInstanceEvent(episode, 'relation-loaded', { relation: episode.relatedWatched });
            }
        }
    }

    public setWatchingStatus(status: ShowWatchingStatus): void {
        this.assertRelationLoaded('watching');

        if (this.watchingStatus === status) {
            return;
        }

        const watching = this.watching ?? this.relatedWatching.attach({});

        watching.statusUrl = SHOW_WATCHING_STATUSES[status];
    }

    public async updateWatchingStatus(status: ShowWatchingStatus): Promise<void> {
        await this.loadRelationIfUnloaded('watching');

        this.setWatchingStatus(status);

        await this.save();
    }

    protected newUrlSlug(): string | null {
        if (!this.name) {
            return null;
        }

        if (!this.startDate) {
            return stringToSlug(this.name);
        }

        return `${stringToSlug(this.name)}-${this.startDate.getFullYear()}`;
    }
}
