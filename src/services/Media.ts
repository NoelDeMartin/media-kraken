import { Store } from 'vuex';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import User from '@/models/users/User';

import Service from '@/services/Service';

import EventBus from '@/utils/EventBus';

interface State {
    moviesContainer: MediaContainer | null;
}

export default class Media extends Service {

    public get movies(): Movie[] {
        if (!this.storage.moviesContainer)
            return [];

        return this.storage.moviesContainer.movies || [];
    }

    public get moviesContainer(): MediaContainer | null {
        return this.storage.moviesContainer;
    }

    protected get storage(): State {
        return this.app.$store.state.media
            ? this.app.$store.state.media
            : {};
    }

    protected async init(): Promise<void> {
        await super.init();
        await this.app.$auth.ready;

        if (this.app.$auth.isLoggedIn()) {
            await this.load(this.app.$auth.user);
        }

        EventBus.on('login', this.load.bind(this));
        EventBus.on('logout', this.unload.bind(this));
    }

    protected registerStoreModule(store: Store<State>): void {
        store.registerModule('media', {
            state: {
                moviesContainer: null,
            },
            mutations: {
                setMoviesContainer(state: State, moviesContainer: MediaContainer | null) {
                    state.moviesContainer = moviesContainer;
                },
            },
        });
    }

    private async load(user: User): Promise<void> {
        const { movies: moviesContainer } = await user.initContainers();

        if (!moviesContainer.isRelationLoaded('movies'))
            await moviesContainer.loadRelation('movies');

        const actionPromises = moviesContainer.movies!.map(async movie => {
            if (movie.isRelationLoaded('actions'))
                return;

            await movie.loadRelation('actions');
        });

        await Promise.all(actionPromises);

        this.app.$store.commit('setMoviesContainer', moviesContainer);
    }

    private async unload(): Promise<void> {
        this.app.$store.commit('setMoviesContainer', null);
    }

}
