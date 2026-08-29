import { Service } from '@aerogel/core';
import { arrayUnique, facade, parseDate } from '@noeldemartin/utils';
import type { Nullable } from '@noeldemartin/utils';
import { ComputedAttribute } from 'soukai-bis';
import type { GetModelInput } from 'soukai-bis';

import type Episode from '@/models/Episode';
import type Season from '@/models/Season';
import Show from '@/models/Show';
import type { ShowWatchingStatus } from '@/models/ShowWatching';
import TMDB, {
    type TMDBEpisode,
    type TMDBSeason,
    type TMDBShow,
    type TMDBShowDetails,
    type TMDBShowExternalIds,
} from '@/services/TMDB';

const WATCHING_STATUSES_WITHOUT_SEASONS = ['dropped', 'pending'] satisfies ShowWatchingStatus[];

export class CatalogService extends Service {
    public async syncIfNeeded(show: Show): Promise<void> {
        const needsSync = await this.needsSync(show);

        if (!needsSync) {
            return;
        }

        await this.sync(show);
    }

    public async importFromTMDB(
        tmdbShow: TMDBShow,
        options: { watchingStatus?: Nullable<ShowWatchingStatus> } = {},
    ): Promise<void> {
        const { details, externalIds, seasons } = await TMDB.getShow(tmdbShow.id, {
            includeSeasons:
                !!options.watchingStatus && !WATCHING_STATUSES_WITHOUT_SEASONS.includes(options.watchingStatus),
        });

        const showAttributes = this.getShowAttributes(details, externalIds);
        const show = await Show.create(showAttributes);

        ComputedAttribute.disableRefreshes();
        ComputedAttribute.disableLoadingRelations();

        try {
            for (const tmdbSeason of seasons) {
                const season = await show.relatedSeasons.create(this.getSeasonAttributes(tmdbSeason.season));

                for (const tmdbEpisode of tmdbSeason.details.episodes) {
                    season.relatedEpisodes.attach(this.getEpisodeAttributes(tmdbEpisode));
                }

                await Promise.all(season.relatedEpisodes.getLoadedModels().map((episode) => episode.save()));
            }

            if (options.watchingStatus) {
                await show.updateWatchingStatus(options.watchingStatus);
            }

            await show.save();
        } finally {
            ComputedAttribute.enableRefreshes();
            ComputedAttribute.enableLoadingRelations();
        }

        await show.pendingEpisodes.updateValue({ refresh: true, loadRelations: true });
    }

    private getShowAttributes(details: TMDBShowDetails, externalIds: TMDBShowExternalIds): GetModelInput<typeof Show> {
        const externalUrls = [TMDB.showUrl(details)];

        if (externalIds.imdb_id) {
            externalUrls.push(`https://www.imdb.com/title/${externalIds.imdb_id}/`);
        }

        return {
            name: details.name,
            description: details.overview,
            posterUrl: TMDB.posterUrl(details),
            backdropUrl: TMDB.backdropUrl(details),
            startDate: parseDate(details.first_air_date) ?? undefined,
            externalUrls,
        };
    }

    private getSeasonAttributes(season: TMDBSeason): GetModelInput<typeof Season> {
        return {
            number: season.season_number,
        };
    }

    private getEpisodeAttributes(episode: TMDBEpisode): GetModelInput<typeof Episode> {
        return {
            name: episode.name,
            number: episode.episode_number,
            publishedAt: episode.air_date ? new Date(episode.air_date) : undefined,
        };
    }

    private async needsSync(show: Show): Promise<boolean> {
        if (WATCHING_STATUSES_WITHOUT_SEASONS.includes(show.watchingStatus)) {
            return false;
        }

        await show.loadRelationIfUnloaded('seasons');

        return !show.seasons || show.seasons.length === 0;
    }

    private async sync(show: Show): Promise<void> {
        if (!show.tmdbId) {
            return;
        }

        await show.loadAllRelationsIfUnloaded();

        const { details, externalIds, seasons } = await TMDB.getShow(show.tmdbId, {
            includeSeasons: !WATCHING_STATUSES_WITHOUT_SEASONS.includes(show.watchingStatus),
        });

        const attributes = this.getShowAttributes(details, externalIds);

        show.setAttributes({
            ...attributes,
            externalUrls: arrayUnique([...show.externalUrls, ...(attributes.externalUrls ?? [])]),
        });

        ComputedAttribute.disableRefreshes();
        ComputedAttribute.disableLoadingRelations();

        try {
            for (const tmdbSeason of seasons) {
                const seasonAttributes = this.getSeasonAttributes(tmdbSeason.season);
                const season =
                    show.seasons?.find((season) => season.number === tmdbSeason.season.season_number) ??
                    show.relatedSeasons.attach(seasonAttributes, { mintUrl: true });

                season.setAttributes(seasonAttributes);

                for (const tmdbEpisode of tmdbSeason.details.episodes) {
                    const episodeAttributes = this.getEpisodeAttributes(tmdbEpisode);
                    const episode = season.episodes?.find((episode) => episode.number === tmdbEpisode.episode_number);

                    if (episode) {
                        episode.setAttributes(episodeAttributes);
                    } else {
                        season.relatedEpisodes.attach(episodeAttributes);
                    }
                }

                await Promise.all(season.relatedEpisodes.getLoadedModels().map((episode) => episode.save()));
                await season.save();
            }

            await show.save();
        } finally {
            ComputedAttribute.enableRefreshes();
            ComputedAttribute.enableLoadingRelations();
        }

        await show.pendingEpisodes.updateValue({ refresh: true, loadRelations: true });
    }
}

export default facade(CatalogService);
