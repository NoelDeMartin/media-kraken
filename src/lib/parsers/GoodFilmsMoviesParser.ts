import { z } from 'zod';

import { MediaValidationError } from '@/lib/errors';
import type { MediaParser } from '@/lib/parsers';
import Movie from '@/models/Movie';
import TMDB from '@/services/TMDB';

const GoodFilmsDataSchema = z.object({
    filmTitle: z.string().min(1),
    filmReleaseYear: z.string().optional(),
});

type Data = z.infer<typeof GoodFilmsDataSchema>;

class GoodFilmsMoviesParser implements MediaParser<Data, Movie> {
    public async validate(data: unknown): Promise<void> {
        const parsed = GoodFilmsDataSchema.safeParse(data);

        if (!parsed.success) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (parsed.data.filmReleaseYear && isNaN(parseInt(parsed.data.filmReleaseYear))) {
            throw new MediaValidationError(['Invalid format']);
        }
    }

    public async parse(data: Data): Promise<Movie> {
        const results = await TMDB.searchMovies(data.filmTitle);
        const releaseYear = data.filmReleaseYear ? parseInt(data.filmReleaseYear) : null;
        const match = results.find(
            (result) =>
                releaseYear === null ||
                (result.release_date && new Date(result.release_date).getFullYear() === releaseYear),
        );

        return match ? Movie.fromTMDB(match) : new Movie({ title: data.filmTitle });
    }
}

export default new GoodFilmsMoviesParser();
