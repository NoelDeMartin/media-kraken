import TheMovieDBApi from '@/api/TheMovieDBApi';

import MediaValidationError from '@/errors/MediaValidationError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';

interface Data {
    title: string;
    date: string;
}

class NetflixMoviesParser implements MediaParser<Data, Movie> {

    public async validate(data: Data): Promise<void> {
        if (typeof data.title !== 'string' || data.title.length < 3)
            throw new MediaValidationError(['Invalid format']);

        if (typeof data.date !== 'string' || isNaN(new Date(data.date) as unknown as number))
            throw new MediaValidationError(['Invalid format']);
    }

    public async parse(data: Data): Promise<Movie> {
        const watchedAt = new Date(data.date);
        const { results } = await TheMovieDBApi.searchMovies(data.title);
        const match = results.find(result => result.release_date && (new Date(result.release_date) < watchedAt))
                    ?? results[0];
        const movie = match ? await TMDBMoviesParser.parse(match) : new Movie({ title: data.title });

        movie.createdAt = watchedAt;
        movie.updatedAt = watchedAt;

        movie.setRelationModels('actions', []);
        movie.watch(watchedAt);

        return movie;
    }

}

export default new NetflixMoviesParser();
