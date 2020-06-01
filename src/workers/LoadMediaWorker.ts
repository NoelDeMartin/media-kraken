import Soukai, { IndexedDBEngine } from 'soukai';

import '@/plugins/soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import ModelsCache from '@/models/ModelsCache';
import Movie from '@/models/soukai/Movie';
import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';
import WatchAction from '@/models/soukai/WatchAction';

import JSONUserParser from '@/utils/parsers/JSONUserParser';

import WebWorker from './WebWorker';

export type Parameters = [object];
export type Result = void;

export default class LoadMediaWorker extends WebWorker<Parameters, Result> {

    private user!: User;
    private moviesContainer!: MediaContainer;

    protected async work(userJson: object): Promise<Result> {
        await this.initStorage(userJson);
        await this.loadMoviesContainer();
        await this.loadMovies();

        if (Soukai.engine instanceof IndexedDBEngine)
            Soukai.engine.closeConnections();
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
            const nonCachedMovieUrls = new Set(moviesContainer.resourceUrls);

            await Promise.all(moviesContainer.documents.map(async document => {
                const movie = await ModelsCache.getFromDocument<Movie>(
                    document,
                    Movie,
                    { actions: WatchAction },
                );

                if (movie === null)
                    return;

                cachedMovies.push(movie);
                nonCachedMovieUrls.delete(document.url);
            }));

            const updatedMovies = await Movie.from(moviesContainer.url).all<Movie>({
                $in: [...nonCachedMovieUrls],
            });

            await Promise.all(updatedMovies.map(async movie => {
                if (!movie.isRelationLoaded('actions'))
                    await movie.loadRelation('actions');

                await ModelsCache.remember(movie, { actions: movie.actions! });
            }));

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
            user.setFetch((...params: any[]) => this.solidFetch(...params));

        return user;
    }

}
