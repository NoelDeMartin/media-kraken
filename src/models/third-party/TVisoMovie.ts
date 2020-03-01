import { Attributes } from 'soukai';

import TheMovieDBApi from '@/api/TheMovieDBApi';

import MediaContainer from '@/models/soukai/MediaContainer';
import Movie from '@/models/soukai/Movie';
import ThirdPartyMovie from '@/models/third-party/ThirdPartyMovie';

import Arr from '@/utils/Arr';
import Time from '@/utils/Time';

import TheMovieDBMovie from './TheMovieDBMovie';

const enum DataMediaType {
    Series = 1,
    Movie = 2,
    // TODO define what 3 means
    TVShow = 4,
}

enum DataStatus {
    Watched = 'watched',
    Following = 'following',
    Pending = 'pending',
}

interface Data {
    title: string;
    imdb: string;
    type: DataMediaType;
    status: DataStatus;
    checkedDate: string;
}

export default class TVisoMovie extends ThirdPartyMovie {

    public static isValidData(data: any): data is Data {
        return typeof data.title === 'string'
            && typeof data.imdb === 'string'
            && data.type === DataMediaType.Movie
            && Arr.contains(Object.values(DataStatus), data.status)
            && (typeof data.checkedDate === 'string' && Time.isValidDateString(data.checkedDate));
    }

    protected data!: Data;

    private get imdbUrl(): string {
        return 'https://www.imdb.com/title/' + this.data.imdb;
    }

    public is(movie: Movie): boolean {
        return Arr.contains(movie.externalUrls, this.imdbUrl);
    }

    public async import(container: MediaContainer): Promise<Movie> {
        const attributes = await this.getAttributes();
        const movie = await container.createMovie(attributes);

        if (this.data.status === DataStatus.Watched)
            await movie.watch(new Date(this.data.checkedDate));

        return movie;
    }

    public async getAttributes(): Promise<Attributes> {
        const { movie_results: movieResults } = await TheMovieDBApi.find(this.data.imdb, { external_source: 'imdb_id' });

        if (!movieResults || movieResults.length === 0)
            return {
                title: this.data.title,
                externalUrls: [this.imdbUrl],
            };

        const attributes = await (new TheMovieDBMovie(movieResults[0])).getAttributes();

        attributes.externalUrls.push(this.imdbUrl);

        return attributes;
    }

}
