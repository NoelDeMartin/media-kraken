import { arrayFilter, isTruthy, parseDate, required, stringToSlug, tap } from '@noeldemartin/utils';
import { emitModelEvent, InvalidationStrategies, isLocalUrl, loaded } from 'soukai-bis';
import type { BelongsToManyRelation, ComputedAttribute, HasOneRelation, UrlFromSlugOptions } from 'soukai-bis';
import type { RouteLocationRaw } from 'vue-router';

import { countryCodeFromUrl } from '@/lib/countries';
import { findExternalId } from '@/lib/domains';
import { parseImdbId } from '@/lib/imdb';
import { parseTmdbId, TMDB_GENRE_URL_PREFIX, tmdbPosterUrl, tmdbShowUrl } from '@/lib/tmdb';
import type { TMDBImageSize } from '@/lib/tmdb';
import type Season from '@/models/Season';
import type { TMDBShow } from '@/services/TMDB';

import type PerformanceRole from './PerformanceRole';
import type Person from './Person';
import type { PersonCredit } from './Person';
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

export type ShowCredits = {
    creators: PersonCredit[];
    cast: PersonCredit[];
};

// Watched episode counts indexed by "YYYY-MM", or "unknown" for episodes without a watch date.
export type WatchedEpisodesByMonth = Record<string, number>;

function watchedMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default class Show extends Model {
    public static cloud = { depth: 1 };

    public static computed = {
        pendingEpisodes: {
            invalidationStrategy: InvalidationStrategies.CONTAINER,
            compute(show: Show): PendingEpisode[] {
                return loaded(show, 'seasons')
                    .filter((season) => season.number !== 0)
                    .flatMap((season) =>
                        loaded(season, 'episodes')
                            .filter((episode) => !loaded(episode, 'watched') && episode.url && episode.publishedAt)
                            .map((episode) => ({
                                url: required(episode.url),
                                seasonNumber: season.number,
                                episodeNumber: episode.number,
                                name: episode.name,
                                publishedAt: required(episode.publishedAt),
                            })),
                    );
            },
        },
        credits: {
            invalidationStrategy: InvalidationStrategies.DOCUMENT,
            compute(show: Show): ShowCredits {
                return {
                    creators: loaded(show, 'creators').map((creator) => creator.credit),
                    cast: loaded(show, 'cast')
                        .map((role) => loaded(role, 'actor'))
                        .filter(isTruthy)
                        .map((actor) => actor.credit),
                };
            },
        },
        watchedEpisodesByMonth: {
            invalidationStrategy: InvalidationStrategies.CONTAINER,
            compute(show: Show): WatchedEpisodesByMonth {
                const counts: WatchedEpisodesByMonth = {};

                for (const season of loaded(show, 'seasons')) {
                    for (const episode of loaded(season, 'episodes')) {
                        const watched = loaded(episode, 'watched');

                        if (!watched) {
                            continue;
                        }

                        // Relations are discovered running this function with proxies, so we can't stringify
                        // anything until we know that it's a real date.
                        const month = watched.date instanceof Date ? watchedMonth(watched.date) : 'unknown';

                        counts[month] = (counts[month] ?? 0) + 1;
                    }
                }

                return counts;
            },
        },
    };

    public static documentUrlFromSlug(slug: string, options: UrlFromSlugOptions = {}): string {
        return super.documentUrlFromSlug(`${slug}/info`, options);
    }

    declare public readonly pendingEpisodes: ComputedAttribute<PendingEpisode[]>;
    declare public readonly credits: ComputedAttribute<ShowCredits>;
    declare public readonly cast?: PerformanceRole[];
    declare public readonly relatedCast: BelongsToManyRelation<this, PerformanceRole, typeof PerformanceRole>;
    declare public readonly creators?: Person[];
    declare public readonly relatedCreators: BelongsToManyRelation<this, Person, typeof Person>;
    declare public readonly watchedEpisodesByMonth: ComputedAttribute<WatchedEpisodesByMonth>;
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

    public get genreIds(): number[] {
        return this.genreUrls.map((url) => findExternalId(TMDB_GENRE_URL_PREFIX, [url], parseTmdbId)).filter(isTruthy);
    }

    public get countryCodes(): string[] {
        return this.countryUrls.map(countryCodeFromUrl).filter(isTruthy);
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
        await this.loadRelationIfUnloaded('watching');
        await this.loadRelationIfUnloaded('cast');
        await this.loadRelationIfUnloaded('creators');
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

    public async deleteWithRelations(): Promise<void> {
        await this.loadAllRelationsIfUnloaded();

        const seasons = this.seasons ?? [];
        const episodes = seasons.flatMap((season) => season.episodes ?? []);

        await Promise.all(
            episodes.map(async (episode) => {
                await episode.watched?.delete();
                await episode.delete();
            }),
        );

        const documentModels = arrayFilter([
            ...(this.cast ?? []).flatMap((role) => [role.actor, role]),
            ...(this.creators ?? []),
            ...seasons,
            this.watching,
        ]);

        for (const model of documentModels) {
            await model.delete();
        }

        await this.delete();
    }
}
