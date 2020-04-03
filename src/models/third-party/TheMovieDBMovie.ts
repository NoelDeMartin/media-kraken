import { Attributes } from 'soukai';
import dayjs from 'dayjs';

import TheMovieDBApi from '@/api/TheMovieDBApi';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';

export interface Data {
    id: number;
    title: string;
    overview?: string | null;
    release_date?: string;
    poster_path?: string | null;
    imdb_id?: string | null;
}

export default class TheMovieDBMovie extends ThirdPartyMovie {

    public data!: Data;
    public id: number;

    constructor(data: Data) {
        super(data, data.title, {
            description: data.overview || undefined,
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

    public get imdbUrl(): string | null {
        return this.data.imdb_id ? ('https://www.imdb.com/title/' + this.data.imdb_id) : null;
    }

    public is(movie: Movie): boolean {
        return Arr.contains(movie.externalUrls, this.url)
            || Arr.contains(movie.externalUrls, this.imdbUrl);
    }

    public isDataComplete(): boolean {
        return 'imdb_id' in this.data;
    }

    public async import(container: MediaContainer): Promise<Movie> {
        if (!this.isDataComplete())
            await this.loadCompleteData();

        const attributes = await this.getAttributes();

        return container.createMovie(attributes);
    }

    private async getAttributes(): Promise<Attributes> {
        const externalUrls = [this.url];

        if (this.imdbUrl)
            externalUrls.push(this.imdbUrl);

        return {
            title: this.title,
            description: this.description,
            releaseDate: this.releaseDate ? this.releaseDate.toDate() : undefined,
            posterUrl: this.posterUrl,
            externalUrls,
        };
    }

    private async loadCompleteData(): Promise<void> {
        this.data = await TheMovieDBApi.getMovie(this.data.id);
    }

}
