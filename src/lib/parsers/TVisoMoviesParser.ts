import { parseDate } from '@noeldemartin/utils';
import { z } from 'zod';

import { MediaValidationError, UnsuitableMediaError } from '@/lib/errors';
import type { MediaParser } from '@/lib/parsers';
import Movie from '@/models/Movie';

const enum DataMediaType {
    Series = 1,
    Movie = 2,
    TVShow = 4,
}

enum Status {
    Watched = 'watched',
    Following = 'following',
    Pending = 'pending',
}

const TVisoDataSchema = z.object({
    title: z.string(),
    imdb: z.string().nullable().optional(),
    type: z.number(),
    status: z.enum(['watched', 'following', 'pending']),
    checkedDate: z.string(),
});

type Data = z.infer<typeof TVisoDataSchema>;

class TVisoMoviesParser implements MediaParser<Data, Movie> {
    public async validate(data: unknown): Promise<void> {
        const parsed = TVisoDataSchema.safeParse(data);

        if (!parsed.success) {
            throw new MediaValidationError(['Invalid format']);
        }

        if (parsed.data.type !== DataMediaType.Movie) {
            throw new UnsuitableMediaError('Not a movie');
        }

        if (!parseDate(parsed.data.checkedDate)) {
            throw new MediaValidationError(['Invalid format']);
        }
    }

    public async parse(data: Data): Promise<Movie> {
        const checkedAt = parseDate(data.checkedDate) ?? new Date();
        const movie = new Movie({
            title: data.title,
            externalUrls: data.imdb ? [`https://www.imdb.com/title/${data.imdb}`] : [],
        });

        if (data.status === Status.Watched) {
            await movie.watch(checkedAt);
        }

        return movie;
    }
}

export default new TVisoMoviesParser();
