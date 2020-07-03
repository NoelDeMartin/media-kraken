import { MediaParser } from '@/utils/parsers';
import EventBus from '@/utils/EventBus';
import Files from '@/utils/Files';
import JSONLDMoviesParser from '@/utils/parsers/JSONLDMoviesParser';
import Time from '@/utils/Time';
import TVisoMoviesParser from '@/utils/parsers/TVisoMoviesParser';

import MediaValidationError from '@/errors/MediaValidationError';
import UnauthorizedError from '@/errors/UnauthorizedError';
import UnsuitableMediaError from '@/errors/IgnoreMediaError';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import User from '@/models/users/User';

import { loadMedia } from '@/workers';
import Service from '@/services/Service';

import ImportProgressModal from '@/components/modals/ImportProgressModal.vue';
import ImportResultModal from '@/components/modals/ImportResultModal.vue';
import IMDBMoviesParser from '@/utils/parsers/IMDBMoviesParser';

interface State {
    moviesContainer: MediaContainer | null;
    importOperation: ImportOperation | null;
}

interface ImportOperation {
    current: number;
    total: number;
    cancelled: boolean;
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
        error: Error;
        data: any;
    }[];
    unprocessed: any[];
}

export interface MediaContainers {
    movies: MediaContainer;
}

export enum MediaSource {
    IMDB = 'imdb',
    JSONLD = 'jsonld',
    TViso = 'tviso',
}

export default class Media extends Service<State> {

    protected storeName: string = 'media';

    public get movies(): Movie[] {
        if (!this.state.moviesContainer)
            return [];

        return this.state.moviesContainer.movies || [];
    }

    public get moviesContainer(): MediaContainer | null {
        return this.state.moviesContainer;
    }

    public get loaded(): boolean {
        return this.moviesContainer !== null;
    }

    public get empty(): boolean {
        return this.movies.length === 0;
    }

    public get importOperation(): ImportOperation | null {
        return this.state.importOperation;
    }

    public async importMovies(data: object[], source: MediaSource): Promise<void> {
        if (this.state.importOperation)
            throw new Error('Import already in progress');

        const { id: progressModalId } = this.app.$ui.openModal(ImportProgressModal, {}, {
            cancellable: false,
        });

        const parser = this.getMoviesParser(source);
        const operation: ImportOperation = {
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

        this.setState({ importOperation: operation });

        for (const movieData of data) {
            await Time.waitAnimationFrame();

            if (operation.cancelled) {
                log.unprocessed = data.slice(operation.current);
                break;
            }

            operation.current++;

            try {
                try {
                    await parser.validate(movieData);
                } catch (error) {
                    if (!(error instanceof MediaValidationError))
                        throw error;

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

                const collectionMovie = this.movies.find(collectionMovie => collectionMovie.is(movie));
                if (collectionMovie) {
                    log.ignored.push({
                        reason: 'You already have this in your collection',
                        data: movieData,
                    });
                    continue;
                }

                await movie.fetchMissingAttributes();
                await this.moviesContainer!.relatedMovies.save(movie);

                log.added.push(movie);
            } catch (error) {
                log.failed.push({
                    error,
                    data: movieData,
                });
            }
        }

        this.setState({ importOperation: null });

        // If this isn't done, showing the result modal causes a weird UI interaction
        // TODO this shouldn't be necessary, debug further.
        Time.wait(0).then(() => {
            this.app.$ui.closeModal(progressModalId, true);
            this.app.$ui.openModal(ImportResultModal, { log }, { cancellable: false });
        });
    }

    public cancelImport(): void {
        if (!this.importOperation)
            return;

        this.importOperation.cancelled = true;
    }

    public exportCollection(): void {
        Files.download(
            'my-collection.json',
            JSON.stringify(this.movies.map(movie => movie.toJsonLD())),
        );
    }

    protected async init(): Promise<void> {
        await super.init();
        await this.app.$auth.ready;

        if (this.app.$auth.isLoggedIn())
            await this.load(this.app.$auth.user);

        EventBus.on('login', this.load.bind(this));
        EventBus.on('logout', this.unload.bind(this));
    }

    protected getInitialState(): State {
        return {
            moviesContainer: null,
            importOperation: null,
        };
    }

    private async load(user: User): Promise<void> {
        try {
            const { movies: moviesContainer } = await loadMedia(user.toJSON());

            await user.initSoukaiEngine();

            Movie.collection = moviesContainer.url;

            this.setState({ moviesContainer });

            EventBus.emit('media-loaded');
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                this.app.$auth.handleUnauthorized();

                return;
            }

            throw error;
        }
    }

    private async unload(): Promise<void> {
        this.setState({ moviesContainer: null });
    }

    private getMoviesParser(source: MediaSource): MediaParser<any, Movie> {
        switch (source) {
            case MediaSource.TViso:
                return TVisoMoviesParser;
            case MediaSource.JSONLD:
                return JSONLDMoviesParser;
            case MediaSource.IMDB:
                return IMDBMoviesParser;
        }
    }

}
