import MediaValidationError from '@/errors/MediaValidationError';

import { MediaParser } from '@/utils/parsers';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';

import TheMovieDBApi from '@/api/TheMovieDBApi';

import Movie from '@/models/soukai/Movie';

interface Data {
    filmTitle: string;
    filmReleaseYear?: string;
}

class GoodFilmsMoviesParser implements MediaParser<Data, Movie> {

    public async validate(data: any): Promise<void> {
        if (
            typeof data.filmTitle !== 'string' ||
            data.filmTitle.length === 0 ||
            (
                typeof data.filmReleaseYear !== 'undefined' &&
                isNaN(parseInt(data.filmReleaseYear))
            )
        )
            throw new MediaValidationError(['Invalid format']);
    }

    public async parse(data: Data): Promise<Movie> {
        const { results } = await TheMovieDBApi.searchMovies(data.filmTitle);
        const releaseYear = data.filmReleaseYear ? parseInt(data.filmReleaseYear) : null;
        const match = results.find(
            result =>
                releaseYear === null ||
                (
                    result.release_date &&
                    new Date(result.release_date).getFullYear() === releaseYear
                ),
        );

        return match
            ? TMDBMoviesParser.parse(match)
            : new Movie({ title: data.filmTitle });
    }

}

export default new GoodFilmsMoviesParser();
