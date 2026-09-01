import { translate } from '@aerogel/core';

import MediaNotFoundError from '@/lib/errors/MediaNotFoundError';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';
import Movie from '@/models/Movie';
import Catalog from '@/services/Catalog';

export interface ImportOperationLog {
    added: Movie[];
    ignored: {
        reason: string;
        data: any;
    }[];
    invalid: {
        reason: string;
        data: any;
    }[];
    failed: {
        notFound: boolean;
        error: Error;
        data: any;
    }[];
    unprocessed: ExternalMedia[];
}

export interface ImportProgressState {
    current: number;
    total: number;
    cancelled: boolean;
}

export class ImportMedia {
    static async run(
        data: ExternalMedia[],
        onProgress?: (progress: ImportProgressState) => void,
        checkCancelled?: () => boolean,
    ): Promise<ImportOperationLog> {
        return new ImportMedia().run(data, onProgress, checkCancelled);
    }

    public async run(
        data: ExternalMedia[],
        onProgress?: (progress: ImportProgressState) => void,
        checkCancelled?: () => boolean,
    ): Promise<ImportOperationLog> {
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

        const existingMovies = await Movie.all();

        for (const media of data) {
            if (checkCancelled?.()) {
                progress.cancelled = true;
                log.unprocessed = data.slice(progress.current);
                break;
            }

            progress.current++;
            onProgress?.(progress);

            if (media.validationError) {
                log.invalid.push({
                    reason: media.validationError,
                    data: media.raw,
                });

                continue;
            }

            if (media.skippedMessage) {
                log.ignored.push({
                    reason: media.skippedMessage,
                    data: media.raw,
                });

                continue;
            }

            try {
                const movie = await Catalog.newFromExternal(media);
                const matchingInCollection = existingMovies.find((existing) => this.isSameMovie(existing, movie));

                if (matchingInCollection) {
                    log.ignored.push({
                        reason: translate('import.result.movieAlreadyInCollection', {
                            title: matchingInCollection.title,
                        }),
                        data: media.raw,
                    });

                    continue;
                }

                const savedMovie = await movie.save();

                log.added.push(savedMovie);
                existingMovies.push(savedMovie);
            } catch (error) {
                log.failed.push({
                    notFound: error instanceof MediaNotFoundError,
                    error: error as Error,
                    data: media.raw,
                });
            }
        }

        return log;
    }

    private isSameMovie(existing: Movie, movie: Movie): boolean {
        if (movie.slug && existing.slug === movie.slug) {
            return true;
        }

        if (movie.externalUrls.length > 0 && existing.externalUrls.some((url) => movie.externalUrls.includes(url))) {
            return true;
        }

        if (movie.tmdbId && existing.tmdbId === movie.tmdbId) {
            return true;
        }

        if (movie.imdbId && existing.imdbId === movie.imdbId) {
            return true;
        }

        return false;
    }
}
