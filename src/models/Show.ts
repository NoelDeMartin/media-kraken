import { parseDate, stringToSlug, tap } from '@noeldemartin/utils';
import { emitModelEvent, InvalidationStrategies, isLocalUrl, loaded } from 'soukai-bis';
import type { BelongsToManyRelation, ComputedAttribute, HasOneRelation, UrlFromSlugOptions } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import { findExternalId } from '@/lib/domains';
import { parseImdbId } from '@/lib/imdb';
import { parseTmdbId, tmdbPosterUrl, tmdbShowUrl } from '@/lib/tmdb';
import type { TMDBImageSize } from '@/lib/tmdb';
import type Season from '@/models/Season';
import type { TMDBShow } from '@/services/TMDB';

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

export default class Show extends Model {
    public static cloud = { depth: 1 };

    public static documentUrlFromSlug(slug: string, options: UrlFromSlugOptions = {}): string {
        return super.documentUrlFromSlug(`${slug}/info`, options);
    }

    public static computed = {
        pendingEpisodes: {
            invalidationStrategy: InvalidationStrategies.CONTAINER,
            // oxlint-disable-next-line typescript/explicit-module-boundary-types -- The computed type is inferred from it
            compute(show: Show) {
                return loaded(show, 'seasons')
                    .filter((season) => season.number !== 0)
                    .flatMap((season) =>
                        loaded(season, 'episodes')
                            .filter((episode) => !loaded(episode, 'watched') && episode.publishedAt)
                            .map((episode) => ({
                                url: episode.url,
                                seasonNumber: season.number,
                                episodeNumber: episode.number,
                                name: episode.name,
                                publishedAt: episode.publishedAt,
                            })),
                    );
            },
        },
    };

    declare public readonly pendingEpisodes: ComputedAttribute<PendingEpisode[]>;
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

    public get slug(): string {
        return this.requireSlug();
    }

    public get releaseYear(): number | null {
        return this.startDate ? this.startDate.getFullYear() : null;
    }

    public get watchingStatus(): ShowWatchingStatus {
        return this.watching?.status ?? 'pending';
    }

    public get tmdbId(): number | null {
        return findExternalId('https://www.themoviedb.org/tv/', this.externalUrls, parseTmdbId);
    }

    public get imdbId(): string | null {
        return findExternalId('https://www.imdb.com/title/', this.externalUrls, parseImdbId);
    }

    public get route(): RouteLocationRaw {
        return {
            name: 'shows.show',
            params: { show: this.slug },
            query: this.url && !isLocalUrl(this.url) ? { url: this.url } : undefined,
        };
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

    public async loadAllRelationsIfUnloaded(): Promise<void> {
        await this.loadRelationIfUnloaded('seasons');
        await Promise.all(this.seasons?.map((season) => season.loadRelationIfUnloaded('episodes')) ?? []);

        for (const season of this.seasons ?? []) {
            for (const episode of season.episodes ?? []) {
                if (episode.isRelationLoaded('watched')) {
                    continue;
                }

                episode.relatedWatched.related = null;

                await emitModelEvent(episode, 'relation-loaded', episode.relatedWatched);
            }
        }
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
