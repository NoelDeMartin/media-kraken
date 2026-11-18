import { isTruthy, required } from '@noeldemartin/utils';
import { belongsToMany, defineSchema, hasOne, InvalidationStrategies, loaded } from 'soukai-bis';
import { array, date, number, string, url } from 'zod';

import BaseMedia from '@/models/BaseMedia';

import type { PendingEpisode, ShowCredits, WatchedEpisodes } from './Show';

export default defineSchema(BaseMedia, {
    rdfClass: 'TVSeries',
    fields: {
        name: string().useAsContainerSlug(),
        startDate: date().rdfProperty('startDate').optional(),
        backdropUrl: url().rdfProperty('thumbnailUrl').optional(),
        creatorUrls: array(url()).rdfProperty('creator').default([]),
        seasonUrls: array(url()).rdfProperty('containsSeason').default([]),
        _numberOfSeasons: number().rdfProperty('numberOfSeasons').optional(),
        _numberOfEpisodes: number().rdfProperty('numberOfEpisodes').optional(),
    },
    relations: {
        creators: belongsToMany('Person', 'creatorUrls').usingSameDocument().autoload(false).onDelete('cascade'),
        seasons: belongsToMany('Season', 'seasonUrls').usingSameDocument().onDelete('cascade'),
        watching: hasOne('ShowWatching', 'showUrl').usingSameDocument().onDelete('cascade'),
    },
    computed: {
        pendingEpisodes: {
            invalidationStrategy: InvalidationStrategies.CONTAINER,
            compute(show): PendingEpisode[] {
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
        watchedEpisodes: {
            invalidationStrategy: InvalidationStrategies.CONTAINER,
            compute(show): WatchedEpisodes {
                let episodes = 0;
                let seasons = 0;

                for (const season of loaded(show, 'seasons')) {
                    const seasonEpisodes = loaded(season, 'episodes');
                    const watchedEpisodes = seasonEpisodes.filter((episode) => loaded(episode, 'watched')).length;

                    episodes += watchedEpisodes;

                    if (season.number !== 0 && seasonEpisodes.length > 0 && watchedEpisodes === seasonEpisodes.length) {
                        seasons++;
                    }
                }

                return { episodes, seasons };
            },
        },
        credits: {
            invalidationStrategy: InvalidationStrategies.DOCUMENT,
            compute(show): ShowCredits {
                return {
                    creators: loaded(show, 'creators').map((creator) => creator.credit),
                    cast: loaded(show, 'cast')
                        .map((role) => loaded(role, 'actor'))
                        .filter(isTruthy)
                        .map((actor) => actor.credit),
                };
            },
        },
    },
});
