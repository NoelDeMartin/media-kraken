import { MalformedDocumentError } from 'soukai-solid';
import { UnauthorizedError } from '@noeldemartin/solid-utils';

import { MediaParser } from '@/utils/parsers';
import Arr from '@/utils/Arr';
import EventBus from '@/utils/EventBus';
import Files from '@/utils/Files';
import GoodFilmsMoviesParser from '@/utils/parsers/GoodFilmsMoviesParser';
import IMDbMoviesParser from '@/utils/parsers/IMDbMoviesParser';
import JSONLDMoviesParser from '@/utils/parsers/JSONLDMoviesParser';
import Storage from '@/utils/Storage';
import Time from '@/utils/Time';
import TVisoMoviesParser from '@/utils/parsers/TVisoMoviesParser';

import MediaValidationError from '@/errors/MediaValidationError';
import UnsuitableMediaError from '@/errors/UnsuitableMediaError';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';
import User from '@/models/users/User';

import { loadMedia } from '@/workers';
import Service, { ComputedStateDefinitions } from '@/services/Service';
import Services from '@/services';

import ImportProgressModal from '@/components/modals/ImportProgressModal.vue';
import ImportResultModal from '@/components/modals/ImportResultModal.vue';

interface State {
    moviesContainer: MediaContainer | null;
    importOperation: ImportOperation | null;
}

interface ComputedState {
    searchIndex: SearchIndex;
}

interface ImportOperation {
    current: number;
    total: number;
    cancelled: boolean;
}

export type SearchIndex = {
    searchableText: string;
    movie: Movie;
}[];

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
    IMDb = 'imdb',
    JSONLD = 'jsonld',
    TViso = 'tviso',
    GoodFilms = 'goodfilms',
}

export default class Media extends Service<State, ComputedState> {

    protected readonly storeNamespace: string = 'media';

    public get movies(): Movie[] {
        if (!this.state.moviesContainer)
            return [];

        return this.state.moviesContainer.movies || [];
    }

    public get moviesContainer(): MediaContainer | null {
        return this.state.moviesContainer;
    }

    public get searchIndex(): SearchIndex {
        return this.getComputedState('searchIndex');
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
        // TODO refactor this method (maybe extract it into a helper class?)

        if (this.state.importOperation)
            throw new Error('Import already in progress');

        const { id: progressModalId } = Services.$ui.openModal(ImportProgressModal, {}, {
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
                    error: error as Error,
                    data: movieData,
                });
            }
        }

        this.setState({ importOperation: null });

        // If this isn't done, showing the result modal causes a weird UI interaction
        // TODO this shouldn't be necessary, debug further.
        Time.wait(0).then(() => {
            Services.$ui.closeModal(progressModalId, true);
            Services.$ui.openModal(ImportResultModal, { log }, { cancellable: false });
        });
    }

    public async removeMovie(movie: Movie): Promise<void> {
        if (!this.loaded)
            return;

        Arr.removeItem(this.moviesContainer!.movies!, movie);

        await ModelsCache.forgetDocument(this.moviesContainer!.url);
        await ModelsCache.forgetDocument(movie.url);
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

    protected async boot(): Promise<void> {
        await super.boot();
        await Services.$app.ready;
        await Services.$auth.ready;

        EventBus.on('logout', this.unload.bind(this));
        EventBus.on('login', this.load.bind(this));

        if (Services.$auth.isLoggedIn())
            await this.load(Services.$auth.user);
    }

    protected getInitialState(): State {
        return {
            moviesContainer: null,
            importOperation: null,
        };
    }

    protected getComputedStateDefinitions(): ComputedStateDefinitions<State, ComputedState> {
        return {
            searchIndex({ moviesContainer }: State) {
                if (!moviesContainer)
                    return [];

                const movies = moviesContainer.movies || [];

                return movies
                    .slice(0)
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map(movie => ({ movie, searchableText: movie.uuid!.replace(/-/g, '') }));
            },
        };
    }

    private async load(user: User): Promise<void> {
        try {
            const ignoredDocumentUrls = Storage.get('media-kraken-malformed-document-urls', []);
            const migrateSchema = Storage.get('media-kraken-migrate-schema', undefined);
            const { movies: moviesContainer } = await loadMedia(user.toJSON(), { ignoredDocumentUrls, migrateSchema });

            await user.initSoukaiEngine();

            Movie.collection = moviesContainer.url;

            this.setState({ moviesContainer });

            EventBus.emit('media-loaded');
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                Services.$auth.handleUnauthorized(error);

                return;
            }

            if (error instanceof MalformedDocumentError) {
                this.handleMalformedDocument(error);

                return;
            }

            this.handleUnknownError(error as Error);
        }
    }

    private async unload(): Promise<void> {
        this.setState({ moviesContainer: null });

        Storage.remove('media-kraken-malformed-document-urls');
        Storage.remove('media-kraken-migrate-schema');
    }

    private getMoviesParser(source: MediaSource): MediaParser<any, Movie> {
        switch (source) {
            case MediaSource.IMDb:
                return IMDbMoviesParser;
            case MediaSource.JSONLD:
                return JSONLDMoviesParser;
            case MediaSource.TViso:
                return TVisoMoviesParser;
            case MediaSource.GoodFilms:
                return GoodFilmsMoviesParser;
        }
    }

    private handleMalformedDocument(error: MalformedDocumentError): void {
        const ignoreDocument = () => {
            const malformedDocumentUrls = Storage.get('media-kraken-malformed-document-urls', []);

            Storage.set('media-kraken-malformed-document-urls', [
                ...malformedDocumentUrls,
                error.documentUrl,
            ]);

            location.reload();
        };

        Services.$app.setCrashReport(
            error,
            {
                title: 'There was a problem reading a document from your collection',
                subtitle: error.documentUrl,
                actions: [{
                    label: 'Ignore this document and continue',
                    handle: ignoreDocument,
                }],
            },
        );
    }

    private handleUnknownError(error: Error): void {
        Services.$app.setCrashReport(error);
    }

}
