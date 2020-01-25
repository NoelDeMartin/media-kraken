import { Store } from 'vuex';

import Movie from '@/models/Movie';

import Service from '@/services/Service';

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

        const movies = await Movie.all();

        this.app.$store.commit('setMovies', movies);
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

}
