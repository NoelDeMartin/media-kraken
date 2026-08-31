import { z } from 'zod';

import { MediaValidationError } from '@/lib/errors';
import type { MediaParser } from '@/lib/parsers';
import Movie from '@/models/Movie';
import TMDB from '@/services/TMDB';

const IMDbDataSchema = z.object({
    imdb: z.string(),
});

type Data = z.infer<typeof IMDbDataSchema>;

class IMDbMoviesParser implements MediaParser<Data, Movie> {
    public async validate(data: unknown): Promise<void> {
        const parsed = IMDbDataSchema.safeParse(data);

        if (!parsed.success) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (await this.alreadyInCollection(parsed.data)) {
            return;
        }

        const tmdbMovie = await TMDB.findImdb(parsed.data.imdb);

        if (tmdbMovie === null) {
            throw new MediaValidationError(['This movie could not be resolved']);
        }
    }

    public async parse(data: Data): Promise<Movie> {
        const tmdbMovie = await TMDB.findImdb(data.imdb);

        if (tmdbMovie) {
            return Movie.fromTMDB(tmdbMovie);
        }

        return new Movie({
            title: '',
            externalUrls: [`https://www.imdb.com/title/${data.imdb}`],
        });
    }

    private async alreadyInCollection(data: Data): Promise<boolean> {
        const imdbUrl = `https://www.imdb.com/title/${data.imdb}`;
        const existingMovies = Movie.getEngine() ? await Movie.all() : [];

        return existingMovies.some(
            (movie: Movie) => movie.imdbId === data.imdb || movie.externalUrls.includes(imdbUrl),
        );
    }
}

export default new IMDbMoviesParser();
