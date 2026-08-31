import { MediaNotFoundError, MediaValidationError, UnsuitableMediaError } from '@/lib/errors';
import type { MediaParser } from '@/lib/parsers';
import GoodFilmsMoviesParser from '@/lib/parsers/GoodFilmsMoviesParser';
import IMDbMoviesParser from '@/lib/parsers/IMDbMoviesParser';
import JSONLDMoviesParser from '@/lib/parsers/JSONLDMoviesParser';
import NetflixMoviesParser from '@/lib/parsers/NetflixMoviesParser';
import TVisoMoviesParser from '@/lib/parsers/TVisoMoviesParser';
import Movie from '@/models/Movie';

export enum MediaSource {
    IMDb = 'imdb',
    Netflix = 'netflix',
    JSONLD = 'jsonld',
    TViso = 'tviso',
    GoodFilms = 'goodfilms',
}

export interface ImportOperationLog {
    added: Movie[];
    ignored: {
        reason: string;
        data: any;
    }[];
    invalid: {
        reasons: string[];
        data: any;
    }[];
    failed: {
        notFound: boolean;
        error: Error;
        data: any;
    }[];
    unprocessed: any[];
}

export interface ImportProgressState {
    current: number;
    total: number;
    cancelled: boolean;
}

export class MovieImporter {
    public getParser(source: MediaSource): MediaParser<any, Movie> {
        switch (source) {
            case MediaSource.IMDb:
                return IMDbMoviesParser;
            case MediaSource.Netflix:
                return NetflixMoviesParser;
            case MediaSource.JSONLD:
                return JSONLDMoviesParser;
            case MediaSource.TViso:
                return TVisoMoviesParser;
            case MediaSource.GoodFilms:
                return GoodFilmsMoviesParser;
        }
    }

    public async importMovies(
        data: object[],
        source: MediaSource,
        onProgress?: (progress: ImportProgressState) => void,
        checkCancelled?: () => boolean,
    ): Promise<ImportOperationLog> {
        const parser = this.getParser(source);
        const progress: ImportProgressState = {
            current: 0,
            total: data.length,
            cancelled: false,
        };
        const log: ImportOperationLog = {
            added: [],
            ignored: [],
            invalid: [],
            failed: [],
            unprocessed: [],
        };

        parser.prepare?.(data);

        for (const movieData of data) {
            if (checkCancelled?.()) {
                progress.cancelled = true;
                log.unprocessed = data.slice(progress.current);
                break;
            }

            progress.current++;
            onProgress?.(progress);

            try {
                try {
                    await parser.validate(movieData);
                } catch (error: any) {
                    if (!(error instanceof MediaValidationError)) {
                        throw error;
                    }

                    if (error instanceof UnsuitableMediaError) {
                        log.ignored.push({
                            reason: error.reason,
                            data: movieData,
                        });
                        continue;
                    }

                    log.invalid.push({
                        reasons: error.reasons,
                        data: movieData,
                    });
                    continue;
                }

                const movie = await parser.parse(movieData);
                const existingMovies = Movie.getEngine() ? await Movie.all() : [];

                const isAlreadyInCollection = existingMovies.some((existing) => {
                    if (existing.slug === movie.slug) {
                        return true;
                    }

                    if (
                        movie.externalUrls.length > 0 &&
                        existing.externalUrls.some((url) => movie.externalUrls.includes(url))
                    ) {
                        return true;
                    }

                    if (movie.tmdbId && existing.tmdbId === movie.tmdbId) {
                        return true;
                    }

                    if (movie.imdbId && existing.imdbId === movie.imdbId) {
                        return true;
                    }

                    return false;
                });

                if (isAlreadyInCollection) {
                    log.ignored.push({
                        reason: 'You already have this in your collection',
                        data: movieData,
                    });
                    continue;
                }

                if (!movie.url) {
                    movie.mintUrl();
                }

                if (movie.watchActions) {
                    for (const action of movie.watchActions) {
                        if (!action.object) {
                            action.setAttribute('object', movie.url);
                        }
                        if (!action.url) {
                            action.mintUrl();
                        }
                    }
                }

                await movie.save();
                log.added.push(movie);
            } catch (error) {
                log.failed.push({
                    notFound: error instanceof MediaNotFoundError,
                    error: error as Error,
                    data: movieData,
                });
            }
        }

        return log;
    }
}

export default new MovieImporter();
