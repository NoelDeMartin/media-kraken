import { arrayChunk } from '@noeldemartin/utils';
import { fetchSolidDocument, SolidDocument } from '@noeldemartin/solid-utils';
import { RDFDocumentMetadata, SolidDocument as SolidDocumentModel, SolidEngine } from 'soukai-solid';
import Soukai, { Attributes } from 'soukai';

import '@/plugins/soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import SolidAuth from '@/authentication/SolidAuth';

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

const MAX_REQUESTS_CHUNK_SIZE = 10;

interface Config {
    ignoredDocumentUrls: string[];
    migrateSchema?: boolean;
}

export default class LoadMediaWorker extends WebWorker<Parameters, Result> {

    private user!: User;
    private config!: Config;
    private moviesContainer!: MediaContainer;
    private processedDocumentsUrls: string[] = [];
    private documentsMetadata: Record<string, RDFDocumentMetadata> = {};

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

        if (Soukai.engine instanceof SolidEngine)
            Soukai.engine.addListener({
                onRDFDocumentLoaded: (url, metadata) => this.documentsMetadata[url] = metadata,
            });
    }

    private async resolveUser(userJson: object): Promise<User> {
        const user = await JSONUserParser.parse(userJson);

        if (user instanceof SolidUser)
            SolidAuth.setFetch(this.solidFetch.bind(this));

        return user;
    }

    private async loadContainers(): Promise<void> {
        this.updateProgressMessage('Loading movies metadata...');

        const { movies } = await this.user.resolveMediaContainers();

        this.moviesContainer = movies;

        await this.migrateContainerSchema('Movies', this.moviesContainer);
    }

    private async loadMovies(): Promise<void> {
        if (this.moviesContainer.isRelationLoaded('movies'))
            return;

        if (!this.moviesContainer.isRelationLoaded('documents')) {
            await this.loadMoviesContainerDocuments();

            ModelsCache.remember(this.moviesContainer, { documents: this.moviesContainer.documents });
        }

        this.moviesContainer.setRelationModels('movies', []);

        await this.loadMoviesFromCache();
        await this.loadMoviesFromDatabase();
    }

    private async loadMoviesFromCache(): Promise<void> {
        const operations = this.moviesContainer.documents.map(async document => {
            if (this.config.ignoredDocumentUrls.includes(document.url))
                return;

            const models = await ModelsCache.getFromDocument(document);

            if (models === null)
                return;

            this.moviesContainer.movies!.push(...models.filter(model => model.modelClass === Movie) as Movie[]);
            this.processedDocumentsUrls.push(document.url);
        });

        await Promise.all(operations);
    }

    private async loadMoviesFromDatabase(): Promise<void> {
        const documents = this.moviesContainer.documents.filter(document =>
            !this.config.ignoredDocumentUrls.includes(document.url) &&
            !this.processedDocumentsUrls.includes(document.url),
        );

        if (documents.length === 0)
            return;

        await this.loadMoviesFromDatabaseByChunks(documents);
    }

    private async loadMoviesFromDatabaseByChunks(documents: SolidDocumentModel[]): Promise<void> {
        const totalDocuments = documents.length;
        const chunks = arrayChunk(documents, MAX_REQUESTS_CHUNK_SIZE);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            this.updateProgressMessage(`Loading movies data (${i*MAX_REQUESTS_CHUNK_SIZE}/${totalDocuments})...`);

            await this.loadMoviesFromDocuments(chunk);
        }
    }

    private async loadMoviesFromDocuments(documents: SolidDocumentModel[]): Promise<void> {
        const movies = await Movie.from(this.moviesContainer.url).all<Movie>({
            $in: documents.map(document => document.url),
        });

        await Promise.all(movies.map(movie => movie.loadRelationIfUnloaded('actions')));

        await this.migrateMoviesSchemas(movies);

        await Promise.all(documents.map(document => ModelsCache.rememberDocument(document.url, document.updatedAt)));
        await Promise.all(movies.map(movie => ModelsCache.remember(movie, { actions: movie.actions! })));

        this.moviesContainer.movies!.push(...movies);
    }

    // TODO remove when this is fixed in soukai-solid.
    private async loadMoviesContainerDocuments(): Promise<void> {
        if (!(Soukai.engine instanceof SolidEngine)) {
            await this.moviesContainer.loadRelation('documents');

            return;
        }

        const chunks = arrayChunk(this.moviesContainer.resourceUrls, MAX_REQUESTS_CHUNK_SIZE);
        const documents: SolidDocument[] = [];

        for (const resourceUrls of chunks) {
            const chunkDocuments = await Promise.all(resourceUrls.map(url => fetchSolidDocument(url, SolidAuth.fetch)));

            documents.push(...chunkDocuments);
        }

        this.moviesContainer.setRelationModels(
            'documents',
            documents.map(document => new SolidDocumentModel(
                { url: document.url, updatedAt: document.getLastModified() },
                true,
            )),
        );
    }

    private async migrateContainerSchema(name: string, container: MediaContainer): Promise<void> {
        if (!(Soukai.engine instanceof SolidEngine))
            return;

        if (this.config.migrateSchema === false)
            return;

        const hasLegacySchema = await container.hasLegacySchema();
        if (!hasLegacySchema)
            return;

        const migrateSchema = await this.shouldMigrateSchema();
        if (!migrateSchema)
            return;

        await container.migrateSchema(name, this.documentsMetadata[container.url]?.describedBy);
    }

    private async migrateMoviesSchemas(movies: Movie[]): Promise<void> {
        if (!(Soukai.engine instanceof SolidEngine))
            return;

        const legacyMovies = this.filterLegacyMovies(movies);
        if (legacyMovies.length === 0)
            return;

        const migrateSchema = await this.shouldMigrateSchema();
        if (!migrateSchema)
            return;

        await Promise.all(legacyMovies.map(movie => movie.migrateSchema()));
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

    private filterLegacyMovies(movies: Movie[]): Movie[] {
        return movies.filter(movie => movie.hasLegacySchema());
    }

    private updateProgressMessage(message: string): void {
        this.runOperation('update-progress-message', message);
    }

    private async shouldMigrateSchema(): Promise<boolean> {
        return this.config.migrateSchema ?? await this.runOperation('confirm-schema-migration');
    }

}
