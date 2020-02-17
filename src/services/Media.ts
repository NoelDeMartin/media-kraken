import { Store } from 'vuex';

import Movie from '@/models/soukai/Movie';

import Service from '@/services/Service';
import EventBus from '@/utils/EventBus';
import User from '@/models/users/User';

interface State {
    movies: Movie[];
}

export default class Media extends Service {

    public get movies(): Movie[] {
        return this.storage.movies || [];
    }

    protected get storage(): State {
        return this.app.$store.state.media
            ? this.app.$store.state.media
            : {};
    }

    public addMovies(movies: Movie[]): void {
        this.app.$store.commit('setMovies', [...this.movies, ...movies]);
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
                movies: [],
            },
            mutations: {
                setMovies(state: State, movies: Movie[]) {
                    state.movies = movies;
                },
            },
        });
    }

    private async load(user: User): Promise<void> {
        const movies = await Movie.from(user.storages[0]).all();
        const actionPromises = movies.map(async movie => {
            if (movie.isRelationLoaded('actions'))
                return;

            await movie.loadRelation('actions');
        });

        await Promise.all(actionPromises);

        this.app.$store.commit('setMovies', movies);
    }

    private async unload(): Promise<void> {
        this.app.$store.commit('setMovies', []);
    }

}
