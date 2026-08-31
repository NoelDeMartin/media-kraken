import { stringToSlug } from '@noeldemartin/utils';
import { z } from 'zod';

import { MediaNotFoundError, MediaValidationError, UnsuitableMediaError } from '@/lib/errors';
import type { NetflixDateParser } from '@/lib/netflix';
import { getNetflixDateParser } from '@/lib/netflix';
import type { MediaParser } from '@/lib/parsers';
import Movie from '@/models/Movie';
import TMDB, { type TMDBMovie } from '@/services/TMDB';

const NetflixDataSchema = z.object({
    title: z.string().min(3),
    date: z.string(),
});

type Data = z.infer<typeof NetflixDataSchema>;

const SHOW_TITLE_REGEX = /((season|series)\s+\d+|limited\s+series):/i;

function isInvalid(date: Date): boolean {
    return isNaN(date as unknown as number);
}

class NetflixMoviesParser implements MediaParser<Data, Movie> {
    private dateParser: NetflixDateParser | null = null;

    public prepare(data: any[]): void {
        this.dateParser = getNetflixDateParser(
            data.map(({ date }) => (typeof date === 'string' ? date : '')).filter(Boolean),
        );
    }

    public async validate(data: unknown): Promise<void> {
        const parsed = NetflixDataSchema.safeParse(data);

        if (!parsed.success) {
            throw new MediaValidationError(['Invalid format']);
        }

        const date = this.parseDate(parsed.data.date);

        if (isInvalid(date)) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (SHOW_TITLE_REGEX.test(parsed.data.title)) {
            throw new UnsuitableMediaError('Not a movie');
        }
    }

    public async parse(data: Data): Promise<Movie> {
        const watchedAt = this.parseDate(data.date);
        const match = await this.findMovie(data);

        if (!match) {
            throw new MediaNotFoundError('This movie could not be found');
        }

        const movie = Movie.fromTMDB(match);

        await movie.watch(watchedAt);

        return movie;
    }

    private async findMovie(data: Data): Promise<TMDBMovie | null> {
        const watchedAt = this.parseDate(data.date);
        const slug = stringToSlug(data.title);
        const results = await TMDB.searchMovies(data.title);

        return (
            results.find(
                (result) =>
                    result.release_date &&
                    new Date(result.release_date) < watchedAt &&
                    stringToSlug(result.title) === slug,
            ) ?? null
        );
    }

    private parseDate(dateString: string): Date {
        return this.dateParser?.parseDate(dateString) ?? new Date(dateString);
    }
}

export default new NetflixMoviesParser();
