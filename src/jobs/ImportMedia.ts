import { translate } from '@aerogel/core';

import MediaNotFoundError from '@/lib/errors/MediaNotFoundError';
import type { ExternalMedia } from '@/lib/parsers/MediaParser';
import Movie from '@/models/Movie';
import Catalog from '@/services/Catalog';

import ProcessingJob from './ProcessingJob';

export interface ImportMediaJobResult {
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

export default class ImportMedia extends ProcessingJob<ExternalMedia, ImportMediaJobResult> {
    constructor(data: ExternalMedia[]) {
        super(data);
    }

    public async run(): Promise<ImportMediaJobResult> {
        const result: ImportMediaJobResult = {
            added: [],
            ignored: [],
            invalid: [],
            failed: [],
            unprocessed: [],
        };

        const existingMovies = await Movie.all();

        for (const [index, media] of this.items.entries()) {
            if (this.cancellationRequested) {
                result.unprocessed = this.items.slice(index);

                this.assertNotCancelled(result);
            }

            try {
                if (media.validationError) {
                    result.invalid.push({
                        reason: media.validationError,
                        data: media.raw,
                    });

                    continue;
                }

                if (media.skippedMessage) {
                    result.ignored.push({
                        reason: media.skippedMessage,
                        data: media.raw,
                    });

                    continue;
                }

                const movie = await Catalog.newFromExternal(media);
                const matchingInCollection = existingMovies.find((existing) => this.isSameMovie(existing, movie));

                if (matchingInCollection) {
                    result.ignored.push({
                        reason: translate('import.result.movieAlreadyInCollection', {
                            title: matchingInCollection.title,
                        }),
                        data: media.raw,
                    });

                    continue;
                }

                const savedMovie = await movie.save();

                result.added.push(savedMovie);
                existingMovies.push(savedMovie);
            } catch (error) {
                result.failed.push({
                    notFound: error instanceof MediaNotFoundError,
                    error: error as Error,
                    data: media.raw,
                });
            } finally {
                await this.markItemCompleted(index);
            }
        }

        return result;
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
