import { SolidDocument } from 'soukai-solid';
import Soukai from 'soukai';

import '@/plugins/soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import Arr from '@/utils/Arr';
import JSONUserParser from '@/utils/parsers/JSONUserParser';

import WebWorker from './WebWorker';

export type Parameters = [object, Partial<Config>?];
export type Result = void;

const MOVIES_CHUNK_SIZE = 10;

interface Config {
    ignoredDocumentUrls: string[];
}

export default class LoadMediaWorker extends WebWorker<Parameters, Result> {

    private user!: User;
    private config!: Config;
    private moviesContainer!: MediaContainer;

    protected async work(userJson: object, config: Partial<Config> = {}): Promise<Result> {
        this.config = {
            ignoredDocumentUrls: [],
            ...config,
        };

        try {
            await this.initStorage(userJson);
            await this.loadContainers();
            await this.loadMovies();
            await this.loadActions();
        } finally {
            await Soukai.closeConnections();
        }
    }

    private async initStorage(userJson: object): Promise<void> {
        this.postMessage('update-progress-message', 'Loading user data...');

        this.user = await this.resolveUser(userJson);

        await this.user.initSoukaiEngine();
    }

    private async loadContainers(): Promise<void> {
        this.postMessage('update-progress-message', 'Loading movies metadata...');

        const containers = await this.user.resolveMediaContainers();

        this.moviesContainer = containers.movies;
        this.postMessage('movies-container-loaded', this.moviesContainer.getAttributes());
    }

    private async loadMovies(): Promise<void> {
        if (this.moviesContainer.isRelationLoaded('movies'))
            return;

        const documentUrls = new Set(this.getDocumentUrlsToLoad());
        const cachedMovies = await this.loadMoviesFromCache(documentUrls);
        const databaseMovies = await this.loadMoviesFromDatabase(documentUrls);

        await this.rememberMovies(databaseMovies);
        await this.rememberDocuments(documentUrls);

        this.moviesContainer.setRelationModels('movies', [
            ...cachedMovies,
            ...databaseMovies,
        ]);
    }

    private async loadActions(): Promise<void> {
        this.postMessage('update-progress-message', 'Almost done...');

        const operations = this.moviesContainer.movies!.map(async movie => {
            if (!movie.isRelationLoaded('actions'))
                await movie.loadRelation('actions');

            this.postMessage(
                'movie-loaded',
                movie.getAttributes(),
                movie.actions!.map(action => action.getAttributes()),
            );
        });

        await Promise.all(operations);
    }

    private async resolveUser(userJson: object): Promise<User> {
        const user = await JSONUserParser.parse(userJson);

        if (user instanceof SolidUser)
            SolidUser.setFetch((...params: any[]) => this.solidFetch(...params));

        return user;
    }

    private getDocumentUrlsToLoad(): string[] {
        return this.moviesContainer.resourceUrls.filter(url => !Arr.contains(url, this.config.ignoredDocumentUrls));
    }

    private async loadMoviesFromCache(documentUrls: Set<string>): Promise<Movie[]> {
        const movies: Movie[] = [];
        const operations = this.moviesContainer.documents.map(async document => {
            const movie = await ModelsCache.getFromDocument(document);

            if (movie === null)
                return;

            documentUrls.delete(document.url);

            if (movie.modelClass !== Movie)
                return;

            movies.push(movie as Movie);
        });

        await Promise.all(operations);

        return movies;
    }

    private async loadMoviesFromDatabase(documentUrls: Set<string>): Promise<Movie[]> {
        // TODO this will only find movies that have the same url as the document,
        // so things like https://example.org/movies/jumanji#it won't work

        let loadedMovies = 0;
        const movies = [];
        const totalMovies = documentUrls.size;

        this.postMessage(
            'update-progress-message',
            `Loading movies data (${loadedMovies}/${totalMovies})...`,
        );

        for (const chunkUrls of Arr.chunk([...documentUrls], MOVIES_CHUNK_SIZE)) {
            const chunkMovies = await Movie.from(this.moviesContainer.url).all<Movie>({
                $in: chunkUrls,
            });

            loadedMovies += chunkMovies.length;

            this.postMessage(
                'update-progress-message',
                `Loading movies data (${loadedMovies}/${totalMovies})...`,
            );

            chunkMovies.forEach(movie => documentUrls.delete(movie.url));
            movies.push(...chunkMovies);
        }

        return movies;
    }

    private async rememberMovies(movies: Movie[]): Promise<void> {
        const operations = movies.map(async movie => {
            if (!movie.isRelationLoaded('actions'))
                await movie.loadRelation('actions');

            await ModelsCache.remember(movie, { actions: movie.actions! });
        });

        await Promise.all(operations);
    }

    private async rememberDocuments(documentUrls: Set<string>): Promise<void> {
        const operations = [...documentUrls].map(url => ModelsCache.remember(new SolidDocument({ url })));

        await Promise.all(operations);
    }

}
