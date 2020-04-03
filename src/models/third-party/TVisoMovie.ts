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

enum Status {
    Watched = 'watched',
    Following = 'following',
    Pending = 'pending',
}

interface Data {
    title: string;
    imdb: string;
    type: DataMediaType;
    status: Status;
    checkedDate: string;
}

export default class TVisoMovie extends ThirdPartyMovie {

    public static isValidData(data: any): data is Data {
        return typeof data.title === 'string'
            && typeof data.imdb === 'string'
            && data.type === DataMediaType.Movie
            && Arr.contains(Object.values(Status), data.status)
            && (typeof data.checkedDate === 'string' && Time.isValidDateString(data.checkedDate));
    }

    public data!: Data;

    constructor(data: Data) {
        super(data, data.title);
    }

    private get imdbUrl(): string {
        return 'https://www.imdb.com/title/' + this.data.imdb;
    }

    public is(movie: Movie): boolean {
        return Arr.contains(movie.externalUrls, this.imdbUrl);
    }

    public async import(container: MediaContainer): Promise<Movie> {
        const movie = await this.createMovie(container);

        await this.updateMovieStatus(movie);

        return movie;
    }

    protected async createMovie(container: MediaContainer): Promise<Movie> {
        const { movie_results: movieResults } = await TheMovieDBApi.find(
            this.data.imdb,
            { external_source: 'imdb_id' },
        );

        if (!movieResults || movieResults.length === 0)
            return container.createMovie({
                title: this.data.title,
                externalUrls: [this.imdbUrl],
            });

        const tmdbMovie = new TheMovieDBMovie({
            ...movieResults[0],
            imdb_id: this.data.imdb,
        });

        return tmdbMovie.import(container);
    }

    private async updateMovieStatus(movie: Movie): Promise<void> {
        switch (this.data.status) {
            case Status.Watched:
                return movie.watch(new Date(this.data.checkedDate));
            case Status.Pending:
                await movie.update({ createdAt: new Date(this.data.checkedDate) });
                return;
        }
    }

}
