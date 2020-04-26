import Soukai, { IndexedDBEngine } from 'soukai';

import '@/plugins/soukai';

import SolidUser from '@/models/users/SolidUser';
import User from '@/models/users/User';

import JSONUserParser from '@/utils/parsers/JSONUserParser';

import WebWorker from './WebWorker';

export type Parameters = [object];
export type Result = void;

export default class LoadMediaWorker extends WebWorker<Parameters, Result> {

    protected async work(userJson: object): Promise<Result> {
        const user = await this.resolveUser(userJson);

        await user.initSoukaiEngine();

        const { movies: moviesContainer } = await user.initContainers();

        this.postMessage('movies-container-loaded', moviesContainer.getAttributes());

        if (!moviesContainer.isRelationLoaded('movies'))
            await moviesContainer.loadRelation('movies');

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

        if (Soukai.engine instanceof IndexedDBEngine)
            Soukai.engine.closeConnections();
    }

    private async resolveUser(userJson: object): Promise<User> {
        const user = await JSONUserParser.parse(userJson);

        if (user instanceof SolidUser)
            user.setFetch((...params: any[]) => this.solidFetch(...params));

        return user;
    }

}
