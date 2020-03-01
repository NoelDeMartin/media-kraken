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
        // TODO handle url missing from config or using custom API key
        const response = await fetch(process.env.VUE_APP_TMB_PROXY_URL as string, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, parameters }),
        });

        if (response.status !== 200)
            throw new Error('Something went wrong with the request to the TMBD API');

        return response.json();
    }

}

export default new TheMovieDBApi();
