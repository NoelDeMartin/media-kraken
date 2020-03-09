import { Data as MovieData } from '@/models/third-party/TheMovieDBMovie';

interface FindResponse {
    movie_results: MovieData[];
}

interface SearchMoviesResponse {
    page: number;
    total_results: number;
    total_pages: number;
    results: MovieData[];
}

interface GetExternalMovieIds {
    imdb_id: string | null;
}

class TheMovieDBApi {

    public find(externalId: string, options: object = {}): Promise<FindResponse> {
        return this.request(`find/${externalId}`, options);
    }

    public searchMovies(query: string): Promise<SearchMoviesResponse> {
        return this.request('search/movie', { query });
    }

    public getExternalMovieIds(movieId: number): Promise<GetExternalMovieIds> {
        return this.request(`movie/${movieId}/external_ids`);
    }

    private async request(path: string, parameters: object = {}): Promise<any> {
        const url = new URL('https://api.themoviedb.org/3/' + path);

        Object
            .entries({
                ...parameters,
                api_key: process.env.VUE_APP_TMDB_API_KEY as string,
            })
            .forEach(([key, value]) => url.searchParams.append(key, value));

        return (await fetch(url.href)).json();
    }

}

export default new TheMovieDBApi();
