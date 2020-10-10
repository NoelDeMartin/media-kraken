import TheMovieDBApi, { TMDBModel } from '@/api/TheMovieDBApi';

class TMDBResolver {

    private cache: Record<string, TMDBModel | null> = {};

    public async resolveImdbId(imdbId: string): Promise<TMDBModel | null> {
        return this.fromCache(`imdb-${imdbId}`, async () => {
            const results = await TheMovieDBApi.find(imdbId, { external_source: 'imdb_id' });
            const models = [...results.movie_results, ...results.person_results, ...results.tv_results];

            return models[0] ?? null;
        });
    }

    private async fromCache(key: string, resolveModel: () => Promise<TMDBModel | null>): Promise<TMDBModel | null> {
        if (!(key in this.cache))
            this.cache[key] = await resolveModel();

        return this.cache[key];
    }

}

export default new TMDBResolver();
