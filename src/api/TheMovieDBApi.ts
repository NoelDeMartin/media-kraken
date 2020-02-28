interface MovieResult {
    id: number;
    title: string;
    poster_path: string;
}

interface FindResponse {
    movie_results: MovieResult[];
}

class TheMovieDBApi {

    public find(externalId: string, options: object = {}): Promise<FindResponse> {
        return this.request(`find/${externalId}`, options);
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
