import TheMovieDBApi, { TMDBMovie } from '@/api/TheMovieDBApi';

import MediaValidationError from '@/errors/MediaValidationError';
import UnsuitableMediaError from '@/errors/UnsuitableMediaError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';
import Str from '@/utils/Str';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';

interface Data {
    title: string;
    date: string;
}

const SHOW_TITLE_REGEX = /season\s+\d+:/i;
const matches: WeakMap<Data, { match: TMDBMovie | null }> = new WeakMap();

class NetflixMoviesParser implements MediaParser<Data, Movie> {

    public async validate(data: Data): Promise<void> {
        if (typeof data.title !== 'string' || data.title.length < 3) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (typeof data.date !== 'string' || isNaN(new Date(data.date) as unknown as number)) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (SHOW_TITLE_REGEX.test(data.title)) {
            throw new UnsuitableMediaError('Not a movie');
        }

        if (!(await this.findMovie(data))) {
            throw new MediaValidationError(['This movie could not be found']);
        }
    }

    public async parse(data: Data): Promise<Movie> {
        const watchedAt = new Date(data.date);
        const match = await this.findMovie(data);

        if (!match) {
            throw new Error('Movie data didn\'t have a match');
        }

        const movie = await TMDBMoviesParser.parse(match);

        movie.createdAt = watchedAt;
        movie.updatedAt = watchedAt;

        movie.setRelationModels('actions', []);
        movie.watch(watchedAt);

        return movie;
    }

    private async findMovie(data: Data): Promise<TMDBMovie | null> {
        if (matches.has(data)) {
            return matches.get(data)?.match ?? null;
        }

        const watchedAt = new Date(data.date);
        const slug = Str.slug(data.title);
        const { results } = await TheMovieDBApi.searchMovies(data.title);
        const match = results.find(result =>
            result.release_date &&
            (new Date(result.release_date) < watchedAt) &&
            Str.slug(result.title) === slug,
        ) ?? null;

        matches.set(data, { match });

        return match;
    }

}

export default new NetflixMoviesParser();
