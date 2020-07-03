import { SolidDocument } from 'soukai-solid';
import Soukai from 'soukai';

import '@/plugins/soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import UnauthorizedError from '@/errors/UnauthorizedError';

import JSONUserParser from '@/utils/parsers/JSONUserParser';

import WebWorker from './WebWorker';

export type Parameters = [object];
export type Result = void;

export default class LoadMediaWorker extends WebWorker<Parameters, Result> {

    private user!: User;
    private moviesContainer!: MediaContainer;

    protected async work(userJson: object): Promise<Result> {
        try {
            await this.initStorage(userJson);
            await this.loadMoviesContainer();
            await this.loadMovies();
        } catch (error) {
            if (error instanceof UnauthorizedError) {
                this.postMessage('unauthorized');

                return;
            }

            throw error;
        } finally {
            await Soukai.closeConnections();
        }
    }

    private async initStorage(userJson: object): Promise<void> {
        this.user = await this.resolveUser(userJson);

        await this.user.initSoukaiEngine();
    }

    private async loadMoviesContainer(): Promise<void> {
        const { movies: moviesContainer } = await this.user.resolveMediaContainers();

        this.postMessage('movies-container-loaded', moviesContainer.getAttributes());

        this.moviesContainer = moviesContainer;
    }

    private async loadMovies(): Promise<void> {
        const moviesContainer = this.moviesContainer;

        if (!moviesContainer.isRelationLoaded('movies')) {
            const cachedMovies: Movie[] = [];
            const nonCachedDocumentUrls = new Set(moviesContainer.resourceUrls);

            await Promise.all(moviesContainer.documents.map(async document => {
                const movie = await ModelsCache.getFromDocument(document);

                if (movie === null)
                    return;

                if (movie.modelClass !== Movie) {
                    nonCachedDocumentUrls.delete(document.url);

                    return;
                }

                nonCachedDocumentUrls.delete(document.url);
                cachedMovies.push(movie as Movie);
            }));

            // TODO this will only find movies that have the same url as the document,
            // so things like https://example.org/movies/jumanji#it won't work

            const updatedMovies = await Movie.from(moviesContainer.url).all<Movie>({
                $in: [...nonCachedDocumentUrls],
            });

            await Promise.all(updatedMovies.map(async movie => {
                nonCachedDocumentUrls.delete(movie.url);

                if (!movie.isRelationLoaded('actions'))
                    await movie.loadRelation('actions');

                await ModelsCache.remember(movie, { actions: movie.actions! });
            }));

            await Promise.all(
                [...nonCachedDocumentUrls]
                    .map(documentUrl => ModelsCache.remember(new SolidDocument({ url: documentUrl }))),
            );

            moviesContainer.setRelationModels('movies', [...cachedMovies, ...updatedMovies]);
        }

        const actionPromises = moviesContainer.movies!.map(async movie => {
            if (!movie.isRelationLoaded('actions'))
                await movie.loadRelation('actions');

            this.postMessage(
                'movie-loaded',
                movie.getAttributes(),
                movie.actions!.map(action => action.getAttributes()),
            );
        });

        await Promise.all(actionPromises);
    }

    private async resolveUser(userJson: object): Promise<User> {
        const user = await JSONUserParser.parse(userJson);

        if (user instanceof SolidUser)
            SolidUser.setFetch((...params: any[]) => this.solidFetch(...params));

        return user;
    }

}
