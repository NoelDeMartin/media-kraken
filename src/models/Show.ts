import { parseDate, stringToSlug, tap, urlResolve, uuid } from '@noeldemartin/utils';
import { emitModelEvent, InvalidationStrategies, loaded } from 'soukai-bis';
import type { BelongsToManyRelation, ComputedAttribute, HasOneRelation, MintUrlOptions } from 'soukai-bis';

import type Season from '@/models/Season';
import type { TMDBShow } from '@/services/TMDB';
import TMDB from '@/services/TMDB';

import Model from './Show.schema';
import ShowWatching, { SHOW_WATCHING_STATUSES } from './ShowWatching';
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
    public static computed = {
        pendingEpisodes: {
            invalidationStrategy: InvalidationStrategies.CONTAINER,
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

    public get tmdbId(): number | null {
        const id = this.externalUrls
            .find((url) => url.startsWith('https://www.themoviedb.org/tv/'))
            ?.split('/')
            .pop()
            ?.replace(/\D/g, '')
            .trim();

        return id ? Number(id) : null;
    }

    public get imdbId(): string | null {
        const id = this.externalUrls
            .find((url) => url.includes('imdb.com/title/'))
            ?.split('/')
            .filter(Boolean)
            .pop();

        return id?.split(/[?#]/)[0] ?? null;
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

    protected newUrlDocumentUrl(options: MintUrlOptions = {}): string {
        const slug = this.getSlug() ?? uuid();

        return urlResolve(options.containerUrl ?? this.static('defaultContainerUrl'), `${slug}/info`);
    }
}
