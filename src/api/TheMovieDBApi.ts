type GetMovieResponse = TMDBMovie;

interface FindResponse {
    movie_results: TMDBMovie[];
    person_results: TMDBPerson[];
    tv_results: TMDBTV[];
}

interface SearchMoviesResponse {
    page: number;
    total_results: number;
    total_pages: number;
    results: TMDBMovie[];
}

export type TMDBModel = TMDBMovie | TMDBTV | TMDBPerson;

export interface TMDBMovie {
    id: number;
    title: string;
    overview?: string | null;
    release_date?: string;
    poster_path?: string | null;
    imdb_id?: string | null;
}

export interface TMDBTV {
    id: number;
}

export interface TMDBPerson {
    id: number;
}

class TheMovieDBApi {

    public getMovie(id: number): Promise<GetMovieResponse> {
        return this.request(`movie/${id}`);
    }

    public find(externalId: string, options: object = {}): Promise<FindResponse> {
        return this.request(`find/${externalId}`, options);
    }

    public searchMovies(query: string): Promise<SearchMoviesResponse> {
        return this.request('search/movie', { query });
    }

    public isMovie(model: TMDBModel): model is TMDBMovie {
        return 'release_date' in model;
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
