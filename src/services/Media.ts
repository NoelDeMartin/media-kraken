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

    protected registerStoreModule(store: Store<State>): void {
        store.registerModule('media', {
            state: {
                movies: [
                    new Movie(
                        '1',
                        'Spirited Away',
                        'https://m.media-amazon.com/images/M/MV5BNmU5OTQ0OWQtOTY0OS00Yjg4LWE1NDYtNDRhYWMxYWY4OTMwXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_UY1200_CR108,0,630,1200_AL_.jpg',
                        'https://www.imdb.com/title/tt0245429',
                    ),
                    new Movie(
                        '2',
                        'Pom Poko',
                        'https://m.media-amazon.com/images/M/MV5BNDM3MDc3OTk4MF5BMl5BanBnXkFtZTcwMzQ2ODIyNw@@._V1_UY1200_CR108,0,630,1200_AL_.jpg"',
                        'https://www.imdb.com/title/tt0110008',
                    ),
                    new Movie(
                        '3',
                        'The Tale of The Princess Kaguya',
                        'https://m.media-amazon.com/images/M/MV5BMTcwODI0MzEwOF5BMl5BanBnXkFtZTgwNjkyNTEwMTE@._V1_UY1200_CR110,0,630,1200_AL_.jpg',
                        'https://www.imdb.com/title/tt2576852',
                    ),
                ],
            },
        });
    }

}
