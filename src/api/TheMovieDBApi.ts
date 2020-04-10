import TheMovieDBMovie, { Data as MovieData } from '@/models/third-party/TheMovieDBMovie';

type GetMovieResponse = MovieData;

interface FindResponse {
    movie_results: MovieData[];
}

interface SearchMoviesResponse {
    page: number;
    total_results: number;
    total_pages: number;
    results: MovieData[];
}

class TheMovieDBApi {

    public getMovie(id: number): Promise<TheMovieDBMovie> {
        return this
            .request<GetMovieResponse>(`movie/${id}`)
            .then(this.parseMovie);
    }

    public find(externalId: string, options: object = {}): Promise<{ movies: TheMovieDBMovie[] }> {
        return this
            .request<FindResponse>(`find/${externalId}`, options)
            .then(({ movie_results}) => ({
                movies: movie_results.map(this.parseMovie),
            }));
    }

    public searchMovies(query: string): Promise<TheMovieDBMovie[]> {
        return this
            .request<SearchMoviesResponse>('search/movie', { query })
            .then(({ results }) => results.map(this.parseMovie));
    }

    private parseMovie(data: MovieData): TheMovieDBMovie {
        return new TheMovieDBMovie(data);
    }

    private async request<Response=any>(path: string, parameters: object = {}): Promise<Response> {
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
