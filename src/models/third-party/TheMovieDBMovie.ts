import { Attributes } from 'soukai';
import dayjs from 'dayjs';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';

export interface Data {
    id: number;
    title: string;
    overview?: string;
    release_date?: string;
    poster_path?: string;
}

export default class TheMovieDBMovie extends ThirdPartyMovie {

    public data!: Data;
    public id: number;

    constructor(data: Data) {
        super(data, data.title, {
            description: data.overview,
            url: 'https://www.themoviedb.org/movie/' + data.id,
            releaseDate: data.release_date
                ? dayjs(data.release_date)
                : undefined,
            posterUrl: data.poster_path
                ? 'http://image.tmdb.org/t/p/w342' + data.poster_path
                : undefined,
        });

        this.id = data.id;
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
            title: this.title,
            description: this.description,
            releaseDate: this.releaseDate ? this.releaseDate.toDate() : undefined,
            posterUrl: this.posterUrl,
            externalUrls: [this.url],
        };
    }

}
