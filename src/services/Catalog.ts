import { Service } from '@aerogel/core';
import { arrayChunk, arrayFrom, arrayUnique, facade, isTruthy, parseDate, stringToSlug } from '@noeldemartin/utils';
import type { Nullable } from '@noeldemartin/utils';
import { ComputedAttribute } from 'soukai-bis';
import type { BelongsToManyRelation, GetModelInput } from 'soukai-bis';

import { countryUrlFromCode } from '@/lib/countries';
import { minutesToISODuration } from '@/lib/durations';
import MediaNotFoundError from '@/lib/errors/MediaNotFoundError';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';
import type Episode from '@/models/Episode';
import Movie from '@/models/Movie';
import Person from '@/models/Person';
import type Season from '@/models/Season';
import Show from '@/models/Show';
import type { ShowWatchingStatus } from '@/models/ShowWatching';
import TMDB, {
    type TMDBEpisode,
    type TMDBMovie,
    type TMDBMovieWithStaff,
    type TMDBMovieSearchResult,
    type TMDBPerson,
    type TMDBSeason,
    type TMDBShow,
    type TMDBShowDetails,
    type TMDBShowExternalIds,
} from '@/services/TMDB';

const WATCHING_STATUSES_WITHOUT_SEASONS = ['dropped', 'pending'] satisfies ShowWatchingStatus[];

export class CatalogService extends Service {
    public ignoresSeasons(watchingStatus: ShowWatchingStatus): boolean {
        return WATCHING_STATUSES_WITHOUT_SEASONS.includes(watchingStatus);
    }

    public async needsSync(media: Show | Movie): Promise<boolean> {
        if (media instanceof Movie) {
            return !(
                media.releaseDate &&
                typeof media.duration === 'string' &&
                media.actorUrls.length > 0 &&
                media.directorUrls.length > 0 &&
                media.genreUrls.length > 0 &&
                media.countryUrls.length > 0 &&
                media.languages.length > 0 &&
                media.externalUrls.length >= 2
            );
        }

        if (WATCHING_STATUSES_WITHOUT_SEASONS.includes(media.watchingStatus)) {
            return false;
        }

        await media.loadRelationIfUnloaded('seasons');

        return !media.seasons || media.seasons.length === 0;
    }

    public async syncIfNeeded(media: Show | Movie | (Movie | Show)[]): Promise<void> {
        const items = arrayFrom(media);
        const chunks = arrayChunk(items, 10);

        for (const chunk of chunks) {
            await Promise.all(
                chunk.map(async (item) => {
                    const needsSync = await this.needsSync(item);

                    if (!needsSync) {
                        return;
                    }

                    await this.sync(item);
                }),
            );
        }
    }

    public async sync(media: Show | Movie | (Movie | Show)[]): Promise<void> {
        const items = arrayFrom(media);
        const chunks = arrayChunk(items, 10);

        for (const chunk of chunks) {
            await Promise.all(
                chunk.map(async (item) => {
                    if (item instanceof Show) {
                        await this.syncShow(item);

                        return;
                    }

                    await this.syncMovie(item);
                }),
            );
        }
    }

    public async newFromExternal(media: ExternalMedia): Promise<Movie> {
        if (media.imdbId) {
            return this.newMovieFromImdb(media.imdbId, { watchedAt: media.watchedAt });
        }

        if (media.type && media.type !== 'movie') {
            throw new Error(`Importing ${media.type} is not supported yet`);
        }

        if (!media.name) {
            throw new MediaNotFoundError();
        }

        return this.newMovieFromName(media.name, { watchedAt: media.watchedAt });
    }

    public async newMovieFromImdb(imdbId: string, options: { watchedAt?: Nullable<Date> } = {}): Promise<Movie> {
        const { movie, show } = await TMDB.findByImdbId(imdbId);

        if (show) {
            throw new Error(`Importing shows is not supported yet`);
        }

        if (!movie) {
            throw new MediaNotFoundError();
        }

        return this.newMovieFromTMDB(movie.id, { watchedAt: options.watchedAt });
    }

    public async importMovieFromTMDB(tmdbMovie: TMDBMovie, options: { watched?: boolean } = {}): Promise<void> {
        const details = await TMDB.getMovie(tmdbMovie.id);
        const movie = new Movie(this.getMovieAttributes(details));

        movie.mintUrl();

        this.attachStaff(movie, details);

        if (options.watched) {
            await movie.watch();
        }

        await movie.save();
    }

    public async importShowFromTMDB(
        tmdbShow: TMDBShow,
        options: { watchingStatus?: Nullable<ShowWatchingStatus> } = {},
    ): Promise<void> {
        const { details, externalIds, seasons } = await TMDB.getShow(tmdbShow.id, {
            includeSeasons: !!options.watchingStatus && !this.ignoresSeasons(options.watchingStatus),
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

    private getMovieAttributes(details: TMDBMovieWithStaff): GetModelInput<typeof Movie> {
        const externalUrls = [TMDB.movieUrl(details)];

        if (details.imdb_id) {
            externalUrls.push(`https://www.imdb.com/title/${details.imdb_id}/`);
        }

        const countryCodes =
            details.origin_country && details.origin_country.length > 0
                ? details.origin_country
                : (details.production_countries ?? []).map((country) => country.iso_3166_1);

        const countryUrls = arrayUnique(countryCodes.map(countryUrlFromCode).filter(isTruthy));
        const genreUrls = (details.genres ?? []).map((genre) => TMDB.genreUrl(genre));
        const languages = arrayUnique((details.spoken_languages ?? []).map((language) => language.iso_639_1));
        const duration = details.runtime && details.runtime > 0 ? minutesToISODuration(details.runtime) : undefined;

        return {
            title: details.title,
            description: details.overview,
            posterUrl: TMDB.posterUrl(details),
            releaseDate: parseDate(details.release_date) ?? undefined,
            externalUrls,
            countryUrls,
            genreUrls,
            languages,
            duration,
        };
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

    private async syncShow(show: Show): Promise<void> {
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

    private async syncMovie(movie: Movie): Promise<void> {
        if (!movie.tmdbId) {
            return;
        }

        const details = await TMDB.getMovie(movie.tmdbId);
        const attributes = this.getMovieAttributes(details);

        movie.setAttributes({
            ...attributes,
            externalUrls: arrayUnique([...movie.externalUrls, ...(attributes.externalUrls ?? [])]),
        });

        await movie.loadRelationIfUnloaded('actors');
        await movie.loadRelationIfUnloaded('directors');

        this.reconcilePersons(movie.relatedActors, details.cast);
        this.reconcilePersons(movie.relatedDirectors, details.directors);

        await movie.save();
    }

    private attachStaff(movie: Movie, details: TMDBMovieWithStaff): void {
        for (const actor of details.cast) {
            movie.relatedActors.attach(Person.fromTMDB(actor), { mintUrl: true });
        }

        for (const director of details.directors) {
            movie.relatedDirectors.attach(Person.fromTMDB(director), { mintUrl: true });
        }
    }

    private reconcilePersons(
        relation: BelongsToManyRelation<Movie, Person, typeof Person>,
        newPersons: TMDBPerson[],
    ): void {
        const existingPersons = relation.related ?? [];

        for (const newPerson of newPersons) {
            const existingPerson = existingPersons.find((person) => person.tmdbId === newPerson.id);

            if (!existingPerson) {
                relation.attach(Person.fromTMDB(newPerson), { mintUrl: true });

                continue;
            }

            if (existingPerson.name === newPerson.name) {
                continue;
            }

            existingPerson.setAttribute('name', newPerson.name);
        }
    }

    private async newMovieFromName(name: string, options: { watchedAt?: Nullable<Date> } = {}): Promise<Movie> {
        const slug = stringToSlug(name);
        const results = await TMDB.search(name, { types: 'movie' });
        const match =
            results.find(
                (result): result is TMDBMovieSearchResult =>
                    result.media_type === 'movie' &&
                    !!result.release_date &&
                    (!options.watchedAt || new Date(result.release_date) <= options.watchedAt) &&
                    stringToSlug(result.title) === slug,
            ) ?? null;

        if (!match) {
            throw new MediaNotFoundError();
        }

        return this.newMovieFromTMDB(match.id, { watchedAt: options.watchedAt });
    }

    private async newMovieFromTMDB(tmdbId: number, options: { watchedAt?: Nullable<Date> } = {}): Promise<Movie> {
        const details = await TMDB.getMovie(tmdbId);
        const movie = new Movie(this.getMovieAttributes(details));

        movie.mintUrl();

        this.attachStaff(movie, details);

        if (options.watchedAt) {
            await movie.watch(options.watchedAt);
        }

        return movie;
    }
}

export default facade(CatalogService);
