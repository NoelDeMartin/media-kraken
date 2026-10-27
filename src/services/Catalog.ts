import { Service } from '@aerogel/core';
import {
    arrayChunk,
    arrayFrom,
    arrayUnique,
    facade,
    isInstanceOf,
    isNullable,
    isTruthy,
    parseDate,
    stringToSlug,
    uuid,
} from '@noeldemartin/utils';
import type { Nullable } from '@noeldemartin/utils';
import { ComputedAttribute } from 'soukai-bis';
import type { BelongsToManyRelation, GetModelInput, ModelWithUrl } from 'soukai-bis';

import { countryUrlFromCode } from '@/lib/countries';
import { mergeExternalUrls } from '@/lib/domains';
import { minutesToISODuration } from '@/lib/durations';
import MediaNotFoundError from '@/lib/errors/MediaNotFoundError';
import { keywordGenreUrls } from '@/lib/genres';
import { imdbUrl } from '@/lib/imdb';
import type { Media } from '@/lib/media';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';
import { tmdbBackdropUrl, tmdbGenreUrl, tmdbMovieUrl, tmdbPosterUrl, tmdbProfileUrl, tmdbShowUrl } from '@/lib/tmdb';
import PerformanceRole from '@/models/PerformanceRole';
import Person from '@/models/Person';
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
import Movie from '@movies/models/Movie';
import type Episode from '@shows/models/Episode';
import type Season from '@shows/models/Season';
import Show from '@shows/models/Show';
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

const WATCHING_STATUSES_WITHOUT_SEASONS = ['dropped', 'pending'] satisfies ShowWatchingStatus[];

type NewMovieOptions = {
    watchedAt?: Nullable<Date>;
    rating?: Nullable<number>;
};

export class CatalogService extends Service {
    public ignoresSeasons(watchingStatus: ShowWatchingStatus): boolean {
        return WATCHING_STATUSES_WITHOUT_SEASONS.includes(watchingStatus);
    }

    public async needsSync(media: Media): Promise<boolean> {
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

        if (!isInstanceOf(media, Show)) {
            return false;
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

    public async syncIfNeeded(media: Media | Media[]): Promise<void> {
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

    public async sync(media: Media | Media[]): Promise<void> {
        const items = arrayFrom(media);
        const chunks = arrayChunk(items, 10);

        for (const chunk of chunks) {
            await Promise.all(
                chunk.map(async (item) => {
                    if (item instanceof Show) {
                        await this.syncShow(item);

                        return;
                    }

                    if (item instanceof Movie) {
                        await this.syncMovie(item);
                    }
                }),
            );
        }
    }

    public identify(model: Movie, tmdb: TMDBMovie): Promise<void>;
    public identify(model: Show, tmdb: TMDBShow): Promise<void>;
    public async identify(model: Media, tmdb: TMDBMovie | TMDBShow): Promise<void> {
        model.setAttributes({ externalUrls: ['title' in tmdb ? tmdbMovieUrl(tmdb.id) : tmdbShowUrl(tmdb.id)] });

        await this.sync(model);
    }

    public async newFromExternal(media: ExternalMedia): Promise<Movie> {
        const options = { watchedAt: media.watchedAt, rating: media.rating };

        if (media.imdbId) {
            return this.newMovieFromImdb(media.imdbId, options);
        }

        if (media.type && media.type !== 'movie') {
            throw new Error(`Importing ${media.type} is not supported yet`);
        }

        if (!media.name) {
            throw new MediaNotFoundError();
        }

        return this.newMovieFromName(media.name, options);
    }

    public async newMovieFromImdb(imdbId: string, options: NewMovieOptions = {}): Promise<Movie> {
        const { movie, show } = await TMDB.findByImdbId(imdbId);

        if (show) {
            throw new Error(`Importing shows is not supported yet`);
        }

        if (!movie) {
            throw new MediaNotFoundError();
        }

        return this.newMovieFromTMDB(movie.id, options);
    }

    public async importMovieFromTMDB(
        tmdbMovie: TMDBMovie,
        options: { watched?: boolean; rating?: Nullable<number>; notes?: Nullable<string> } = {},
    ): Promise<ModelWithUrl<Movie>> {
        const details = await TMDB.getMovie(tmdbMovie.id, { includeCredits: true, includeKeywords: true });
        const movie = new Movie(this.getMovieAttributes(details));

        movie.mintUrl();

        this.attachStaff(movie, details);

        if (options.watched) {
            movie.setWatchedAt(new Date());
        }

        if (!isNullable(options.rating)) {
            movie.setRating(options.rating);
        }

        if (options.notes) {
            movie.setNotes(options.notes);
        }

        return movie.save();
    }

    public async importShowFromTMDB(
        tmdbShow: TMDBShow,
        options: {
            watchingStatus?: Nullable<ShowWatchingStatus>;
            rating?: Nullable<number>;
            notes?: Nullable<string>;
        } = {},
    ): Promise<ModelWithUrl<Show>> {
        const { details, externalIds, seasons } = await TMDB.getShow(tmdbShow.id, {
            includeSeasons: !!options.watchingStatus && !this.ignoresSeasons(options.watchingStatus),
            includeCredits: true,
            includeKeywords: true,
        });

        const showAttributes = this.getShowAttributes(details, externalIds);
        const newShow = new Show(showAttributes);

        newShow.mintUrl();

        this.attachStaff(newShow, details);

        if (options.watchingStatus) {
            newShow.setWatchingStatus(options.watchingStatus);
        }

        if (!isNullable(options.rating)) {
            newShow.setRating(options.rating);
        }

        if (options.notes) {
            newShow.setNotes(options.notes);
        }

        const show = await newShow.save();

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
            genreUrls: [
                ...details.genres.map((genre) => tmdbGenreUrl(genre.id)),
                ...keywordGenreUrls(details.keywords ?? []),
            ],
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
            includeCredits: true,
            includeKeywords: true,
        });

        const attributes = this.getShowAttributes(details, externalIds);

        show.setAttributes({
            ...attributes,
            externalUrls: mergeExternalUrls(show.externalUrls, attributes.externalUrls ?? []),
        });

        details.cast && this.reconcileCast(show, details.cast);
        details.creators && this.reconcilePersons(show.relatedCreators, details.creators);

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

        const details = await TMDB.getMovie(movie.tmdbId, { includeCredits: true, includeKeywords: true });
        const attributes = this.getMovieAttributes(details);

        movie.setAttributes({
            ...attributes,
            externalUrls: mergeExternalUrls(movie.externalUrls, attributes.externalUrls ?? []),
        });

        await movie.loadAllRelationsIfUnloaded();

        details.cast && this.reconcileCast(movie, details.cast);
        details.directors && this.reconcilePersons(movie.relatedDirectors, details.directors);

        await movie.save();
    }

    private attachStaff(movie: Movie, details: TMDBMovieWithStaff): void;
    private attachStaff(show: Show, details: TMDBShowWithStaff): void;
    private attachStaff(media: Media, details: TMDBMovieWithStaff | TMDBShowWithStaff): void {
        for (const credit of details.cast ?? []) {
            this.attachCastMember(media, credit);
        }

        if (media instanceof Movie) {
            for (const director of ('directors' in details && details.directors) || []) {
                media.relatedDirectors.attach(Person.fromTMDB(director), { mintUrl: true });
            }

            return;
        }

        if (media instanceof Show) {
            for (const creator of ('creators' in details && details.creators) || []) {
                media.relatedCreators.attach(Person.fromTMDB(creator), { mintUrl: true });
            }
        }
    }

    private attachCastMember(media: Media, credit: TMDBCastCredit): void {
        const person = Person.fromTMDB(credit);

        const personUrl = person.mintUrl({ documentUrl: media.getDocumentUrl(), resourceHash: uuid() });

        const role = media.relatedCast.attach(
            new PerformanceRole({
                actorUrl: personUrl,
                characterNames: credit.characters,
            }),
            { mintUrl: true },
        );

        role.relatedActor.attach(person);
    }

    private reconcileCast(media: Media, credits: TMDBCastCredit[]): void {
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
            role.relatedActor.detach({ delete: true });
        }

        media.relatedCast.detach(staleRoles, { delete: true });
    }

    private reconcilePersons<T extends Media>(
        relation: BelongsToManyRelation<T, Person, typeof Person>,
        newPersons: TMDBPerson[],
    ): void {
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

        relation.detach(stalePersons, { delete: true });
    }

    private async newMovieFromName(name: string, options: NewMovieOptions = {}): Promise<Movie> {
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

        return this.newMovieFromTMDB(match.id, options);
    }

    private async newMovieFromTMDB(tmdbId: number, options: NewMovieOptions = {}): Promise<Movie> {
        const details = await TMDB.getMovie(tmdbId, { includeCredits: true, includeKeywords: true });
        const movie = new Movie(this.getMovieAttributes(details));

        movie.mintUrl();

        this.attachStaff(movie, details);

        if (options.watchedAt) {
            movie.setWatchedAt(options.watchedAt);
        }

        if (!isNullable(options.rating)) {
            movie.setRating(options.rating);
        }

        return movie;
    }
}

export default facade(CatalogService);
