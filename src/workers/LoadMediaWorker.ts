import { SolidDocument } from 'soukai-solid';
import Soukai, { Attributes } from 'soukai';

import '@/plugins/soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import Arr from '@/utils/Arr';
import JSONUserParser from '@/utils/parsers/JSONUserParser';

import WebWorker from './WebWorker';

export interface SerializedMoviesContainer {
    attributes: Attributes;
    movies: SerializedMovie[];
}

export interface SerializedMovie {
    attributes: Attributes;
    actionsAttributes: Attributes[];
}

export type Parameters = [object, Partial<Config>?];
export type Result = { movies: SerializedMoviesContainer };

const MOVIES_CHUNK_SIZE = 10;

interface Config {
    ignoredDocumentUrls: string[];
}

export default class LoadMediaWorker extends WebWorker<Parameters, Result> {

    private user!: User;
    private config!: Config;
    private moviesContainer!: MediaContainer;
    private processedDocumentUrls: string[] = [];

    protected async work(userJson: object, config: Partial<Config> = {}): Promise<Result> {
        this.config = {
            ignoredDocumentUrls: [],
            ...config,
        };

        try {
            await this.initStorage(userJson);
            await this.loadContainers();
            await this.loadMovies();

            this.updateProgressMessage('Almost done...');

            return {
                movies: this.serializeMoviesContainer(),
            };
        } finally {
            await Soukai.closeConnections();
        }
    }

    private async initStorage(userJson: object): Promise<void> {
        this.updateProgressMessage('Loading user data...');

        this.user = await this.resolveUser(userJson);

        await this.user.initSoukaiEngine();
    }

    private async loadContainers(): Promise<void> {
        this.updateProgressMessage('Loading movies metadata...');

        const { movies } = await this.user.resolveMediaContainers();

        this.moviesContainer = movies;
    }

    private async loadMovies(): Promise<void> {
        if (this.moviesContainer.isRelationLoaded('movies'))
            return;

        if (!this.moviesContainer.isRelationLoaded('documents'))
            await this.moviesContainer.loadRelation('documents');

        this.moviesContainer.setRelationModels('movies', []);

        await this.loadMoviesFromCache();
        await this.loadMoviesFromDatabase();
    }

    private serializeMoviesContainer(): SerializedMoviesContainer {
        return {
            attributes: this.moviesContainer.getAttributes(),
            movies: this.moviesContainer.movies!.map(movie => ({
                attributes: movie.getAttributes(),
                actionsAttributes: movie.actions!.map(action => action.getAttributes()),
            })),
        };
    }

    private async resolveUser(userJson: object): Promise<User> {
        const user = await JSONUserParser.parse(userJson);

        if (user instanceof SolidUser)
            SolidUser.setFetch((...params: any[]) => this.solidAuthClientFetch(...params));

        return user;
    }

    private async loadMoviesFromCache(): Promise<void> {
        const operations = this.moviesContainer.documents.map(async document => {
            if (Arr.contains(document.url, this.config.ignoredDocumentUrls))
                return;

            const models = await ModelsCache.getFromDocument(document);

            if (models === null)
                return;

            this.moviesContainer.movies!.push(...models.filter(model => model.modelClass === Movie) as Movie[]);
            this.processedDocumentUrls.push(document.url);
        });

        await Promise.all(operations);
    }

    private async loadMoviesFromDatabase(): Promise<void> {
        const documents = this.moviesContainer.documents.filter(document =>
            !Arr.contains(document.url, this.config.ignoredDocumentUrls) &&
            !Arr.contains(document.url, this.processedDocumentUrls),
        );

        if (documents.length === 0)
            return;

        await this.loadMoviesFromDatabaseByChunks(documents);
    }

    private async loadMoviesFromDatabaseByChunks(documents: SolidDocument[]): Promise<void> {
        const totalDocuments = documents.length;
        const chunks = Arr.chunk(documents, MOVIES_CHUNK_SIZE);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            this.updateProgressMessage(`Loading movies data (${i*MOVIES_CHUNK_SIZE}/${totalDocuments})...`);

            await this.loadMoviesFromDocuments(chunk);
        }
    }

    private async loadMoviesFromDocuments(documents: SolidDocument[]): Promise<void> {
        const movies = await Movie.from(this.moviesContainer.url).all<Movie>({
            $in: documents.map(document => document.url),
        });

        await Promise.all(movies.map(async movie => {
            if (movie.isRelationLoaded('actions'))
                return;

            await movie.loadRelation('actions');
        }));

        await Promise.all(documents.map(document => ModelsCache.rememberDocument(document.url, document.updatedAt)));
        await Promise.all(movies.map(movie => ModelsCache.remember(movie, { actions: movie.actions! })));

        this.moviesContainer.movies!.push(...movies);
    }

    private updateProgressMessage(message: string): void {
        this.runOperation('update-progress-message', message);
    }

}
