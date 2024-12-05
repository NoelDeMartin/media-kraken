import TheMovieDBApi, { TMDBMovie } from '@/api/TheMovieDBApi';

import MediaValidationError from '@/errors/MediaValidationError';
import UnsuitableMediaError from '@/errors/UnsuitableMediaError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';
import Str from '@/utils/Str';
import TMDBMoviesParser from '@/utils/parsers/TMDBMoviesParser';
import { getNetflixDateParser, NetflixDateParser } from '@/utils/netflix';
import MediaNotFoundError from '@/errors/MediaNotFoundError';

interface Data {
    title: string;
    date: string;
}

const SHOW_TITLE_REGEX = /((season|series)\s+\d+|limited\s+series):/i;

function isInvalid(date: Date): boolean {
    return isNaN(date as unknown as number);
}

class NetflixMoviesParser implements MediaParser<Data, Movie> {

    private dateParser: NetflixDateParser | null = null;

    public prepare(data: any[]): void {
        this.dateParser = getNetflixDateParser(data.map(({ date }) => date));
    }

    public async validate(data: Data): Promise<void> {
        if (typeof data.title !== 'string' || data.title.length < 3) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (typeof data.date !== 'string' || isInvalid(this.parseDate(data.date))) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (SHOW_TITLE_REGEX.test(data.title)) {
            throw new UnsuitableMediaError('Not a movie');
        }
    }

    public async parse(data: Data): Promise<Movie> {
        const watchedAt = this.parseDate(data.date);
        const match = await this.findMovie(data);

        if (!match) {
            throw new MediaNotFoundError('This movie could not be found');
        }

        const movie = await TMDBMoviesParser.parse(match);

        movie.createdAt = watchedAt;
        movie.updatedAt = watchedAt;

        movie.setRelationModels('actions', []);
        movie.watch(watchedAt);

        return movie;
    }

    private async findMovie(data: Data): Promise<TMDBMovie | null> {
        const watchedAt = this.parseDate(data.date);
        const slug = Str.slug(data.title);
        const { results } = await TheMovieDBApi.searchMovies(data.title);

        return results.find(result =>
            result.release_date &&
            (new Date(result.release_date) < watchedAt) &&
            Str.slug(result.title) === slug,
        ) ?? null;
    }

    private parseDate(dateString: string): Date {
        return this.dateParser?.parseDate(dateString) ?? new Date(dateString);
    }

}

export default new NetflixMoviesParser();
