import { Service } from '@aerogel/core';
import {
    arrayChunk,
    arrayFrom,
    arrayUnique,
    facade,
    isTruthy,
    parseDate,
    required,
    stringToSlug,
    uuid,
} from '@noeldemartin/utils';
import type { Nullable } from '@noeldemartin/utils';
import { ComputedAttribute } from 'soukai-bis';
import type { BelongsToManyRelation, GetModelInput, Model, MultiModelRelation } from 'soukai-bis';

import { countryUrlFromCode } from '@/lib/countries';
import { mergeExternalUrls } from '@/lib/domains';
import { minutesToISODuration } from '@/lib/durations';
import MediaNotFoundError from '@/lib/errors/MediaNotFoundError';
import { imdbUrl } from '@/lib/imdb';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';
import { tmdbBackdropUrl, tmdbGenreUrl, tmdbMovieUrl, tmdbPosterUrl, tmdbProfileUrl, tmdbShowUrl } from '@/lib/tmdb';
import type Episode from '@/models/Episode';
import Movie from '@/models/Movie';
import PerformanceRole from '@/models/PerformanceRole';
import Person from '@/models/Person';
import type Season from '@/models/Season';
import Show from '@/models/Show';
import type { ShowWatchingStatus } from '@/models/ShowWatching';
import TMDB, {
    type TMDBCastCredit,
    type TMDBEpisode,
    type TMDBMediaWithStaff,
    type TMDBMovie,
    type TMDBMovieWithStaff,
    type TMDBMovieSearchResult,
    type TMDBPerson,
    type TMDBSeason,
    type TMDBShow,
    type TMDBShowExternalIds,
    type TMDBShowWithStaff,
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

        const hasMetadata =
            media.startDate &&
            typeof media._numberOfSeasons === 'number' &&
            typeof media._numberOfEpisodes === 'number' &&
            media.actorUrls.length > 0 &&
            media.genreUrls.length > 0 &&
            media.countryUrls.length > 0 &&
            media.languages.length > 0 &&
            media.externalUrls.length >= 2;

        if (!hasMetadata) {
            return true;
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

    public identify(model: Movie, tmdb: TMDBMovie): Promise<void>;
    public identify(model: Show, tmdb: TMDBShow): Promise<void>;
    public async identify(model: Movie | Show, tmdb: TMDBMovie | TMDBShow): Promise<void> {
        model.setAttributes({ externalUrls: ['title' in tmdb ? tmdbMovieUrl(tmdb.id) : tmdbShowUrl(tmdb.id)] });

        await this.sync(model);
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

    public async importMovieFromTMDB(tmdbMovie: TMDBMovie, options: { watched?: boolean } = {}): Promise<Movie> {
        const details = await TMDB.getMovie(tmdbMovie.id, { includeStaff: true });
        const movie = new Movie(this.getMovieAttributes(details));

        movie.mintUrl();

        this.attachStaff(movie, details);

        if (options.watched) {
            await movie.watch();
        }

        await movie.save();

        return movie;
    }

    public async importShowFromTMDB(
        tmdbShow: TMDBShow,
        options: { watchingStatus?: Nullable<ShowWatchingStatus> } = {},
    ): Promise<Show> {
        const { details, externalIds, seasons } = await TMDB.getShow(tmdbShow.id, {
            includeSeasons: !!options.watchingStatus && !this.ignoresSeasons(options.watchingStatus),
            includeStaff: true,
        });

        const showAttributes = this.getShowAttributes(details, externalIds);
        const show = new Show(showAttributes);

        show.mintUrl();

        this.attachStaff(show, details);

        await show.save();

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

        return show;
    }

    private getMovieAttributes(details: TMDBMovieWithStaff): GetModelInput<typeof Movie> {
        const externalUrls = [tmdbMovieUrl(details.id)];

        if (details.imdb_id) {
            externalUrls.push(imdbUrl(details.imdb_id));
        }

        const duration = details.runtime && details.runtime > 0 ? minutesToISODuration(details.runtime) : undefined;

        return {
            title: details.title,
            description: details.overview,
            posterUrl: tmdbPosterUrl(details.poster_path),
            releaseDate: parseDate(details.release_date) ?? undefined,
            externalUrls,
            duration,
            ...this.getMediaAttributes(details),
        };
    }

    private getShowAttributes(
        details: TMDBShowWithStaff,
        externalIds: TMDBShowExternalIds,
    ): GetModelInput<typeof Show> {
        const externalUrls = [tmdbShowUrl(details.id)];

        if (externalIds.imdb_id) {
            externalUrls.push(imdbUrl(externalIds.imdb_id));
        }

        return {
            name: details.name,
            description: details.overview,
            posterUrl: tmdbPosterUrl(details.poster_path),
            backdropUrl: tmdbBackdropUrl(details.backdrop_path),
            startDate: parseDate(details.first_air_date) ?? undefined,
            externalUrls,
            _numberOfSeasons: details.number_of_seasons ?? undefined,
            _numberOfEpisodes: details.number_of_episodes ?? undefined,
            ...this.getMediaAttributes(details),
        };
    }

    private getMediaAttributes(details: TMDBMediaWithStaff): {
        countryUrls: string[];
        genreUrls: string[];
        languages: string[];
    } {
        const countryCodes =
            details.origin_country.length > 0
                ? details.origin_country
                : details.production_countries.map((country) => country.iso_3166_1);

        return {
            countryUrls: arrayUnique(countryCodes.map(countryUrlFromCode).filter(isTruthy)),
            genreUrls: details.genres.map((genre) => tmdbGenreUrl(genre.id)),
            languages: arrayUnique(details.spoken_languages.map((language) => language.iso_639_1)),
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
            includeStaff: true,
        });

        const attributes = this.getShowAttributes(details, externalIds);

        show.setAttributes({
            ...attributes,
            externalUrls: mergeExternalUrls(show.externalUrls, attributes.externalUrls ?? []),
        });

        details.cast && (await this.reconcileCast(show, details.cast));
        details.creators && (await this.reconcilePersons(show.relatedCreators, details.creators));

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

        const details = await TMDB.getMovie(movie.tmdbId, { includeStaff: true });
        const attributes = this.getMovieAttributes(details);

        movie.setAttributes({
            ...attributes,
            externalUrls: mergeExternalUrls(movie.externalUrls, attributes.externalUrls ?? []),
        });

        await movie.loadAllRelationsIfUnloaded();

        details.cast && (await this.reconcileCast(movie, details.cast));
        details.directors && (await this.reconcilePersons(movie.relatedDirectors, details.directors));

        await movie.save();
    }

    private attachStaff(movie: Movie, details: TMDBMovieWithStaff): void;
    private attachStaff(show: Show, details: TMDBShowWithStaff): void;
    private attachStaff(media: Movie | Show, details: TMDBMovieWithStaff | TMDBShowWithStaff): void {
        for (const credit of details.cast ?? []) {
            this.attachCastMember(media, credit);
        }

        if (media instanceof Movie) {
            for (const director of ('directors' in details && details.directors) || []) {
                media.relatedDirectors.attach(Person.fromTMDB(director), { mintUrl: true });
            }

            return;
        }

        for (const creator of ('creators' in details && details.creators) || []) {
            media.relatedCreators.attach(Person.fromTMDB(creator), { mintUrl: true });
        }
    }

    private attachCastMember(media: Movie | Show, credit: TMDBCastCredit): void {
        const person = Person.fromTMDB(credit);

        person.mintUrl({ documentUrl: media.getDocumentUrl(), resourceHash: uuid() });

        const role = media.relatedCast.attach(
            new PerformanceRole({
                actorUrl: person.requireUrl(),
                characterNames: credit.characters,
            }),
            { mintUrl: true },
        );

        role.relatedActor.attach(person);
    }

    private async reconcileCast(media: Movie | Show, credits: TMDBCastCredit[]): Promise<void> {
        const existingRoles = media.relatedCast.related ?? [];
        const staleRoles = existingRoles.filter((role) => !credits.some((credit) => credit.id === role.actor?.tmdbId));

        for (const credit of credits) {
            const existingRole = existingRoles.find((role) => role.actor?.tmdbId === credit.id);

            if (!existingRole?.actor) {
                this.attachCastMember(media, credit);

                continue;
            }

            existingRole.setAttribute('characterNames', credit.characters);
            existingRole.actor.setAttributes({
                name: credit.name,
                imageUrl: tmdbProfileUrl(credit.profile_path),
            });
        }

        for (const role of staleRoles) {
            await role.relatedActor.delete();
        }

        await this.deleteRelatedModels(media.relatedCast, staleRoles);
    }

    private async reconcilePersons(
        relation:
            | BelongsToManyRelation<Movie, Person, typeof Person>
            | BelongsToManyRelation<Show, Person, typeof Person>,
        newPersons: TMDBPerson[],
    ): Promise<void> {
        const existingPersons = relation.related ?? [];
        const stalePersons = existingPersons.filter(
            (person) => !newPersons.some((newPerson) => newPerson.id === person.tmdbId),
        );

        for (const newPerson of newPersons) {
            const existingPerson = existingPersons.find((person) => person.tmdbId === newPerson.id);

            if (!existingPerson) {
                relation.attach(Person.fromTMDB(newPerson), { mintUrl: true });

                continue;
            }

            existingPerson.setAttributes({
                name: newPerson.name,
                imageUrl: tmdbProfileUrl(newPerson.profile_path),
            });
        }

        await this.deleteRelatedModels(relation, stalePersons);
    }

    private async deleteRelatedModels(relation: MultiModelRelation, models: Model[]): Promise<void> {
        if (models.length === 0) {
            return;
        }

        const foreignKeyName = required(relation.foreignKeyName);
        const deletedUrls = models.map((model) => model.url);
        const foreignKeys = arrayFrom(relation.parent.getAttribute(foreignKeyName) as string[]);

        relation.parent.setAttribute(
            foreignKeyName,
            foreignKeys.filter((url) => !deletedUrls.includes(url)),
        );

        for (const model of models) {
            await relation.delete(model);
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
        const details = await TMDB.getMovie(tmdbId, { includeStaff: true });
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
