import { Attributes } from 'soukai';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';

interface Data {
    id: number;
    title: string;
    poster_path: string;
}

export default class TheMovieDBMovie extends ThirdPartyMovie {

    protected data!: Data;

    private get url(): string {
        return 'https://www.themoviedb.org/movie/' + this.data.id;
    }

    public is(movie: Movie): boolean {
        return Arr.contains(movie.externalUrls, this.url);
    }

    public async import(container: MediaContainer): Promise<Movie> {
        const attributes = await this.getAttributes();

        return container.createMovie(attributes);
    }

    public async getAttributes(): Promise<Attributes> {
        return {
            title: this.data.title,
            posterUrl: 'http://image.tmdb.org/t/p/w342' + this.data.poster_path,
            externalUrls: [this.url],
        };
    }

}
