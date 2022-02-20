import MediaValidationError from '@/errors/MediaValidationError';
import UnsuitableMediaError from '@/errors/UnsuitableMediaError';

import Time from '@/utils/Time';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';

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

interface Data {
    title: string;
    imdb: string | null;
    type: DataMediaType;
    status: Status;
    checkedDate: string;
}

class TVisoMoviesParser implements MediaParser<Data, Movie> {

    public async validate(data: any): Promise<void> {
        if (data.type !== DataMediaType.Movie)
            throw new UnsuitableMediaError('Not a movie');

        if (
            typeof data.title !== 'string' ||
            (data.imdb !== null && typeof data.imdb !== 'string') ||
            !Object.values(Status).includes(data.status) ||
            !Time.isValidDateString(data.checkedDate)
        )
            throw new MediaValidationError(['Invalid format']);
    }

    public async parse(data: Data): Promise<Movie> {
        const checkedAt = new Date(data.checkedDate);
        const movie = new Movie({
            title: data.title,
            externalUrls: data.imdb !== null
                ? [`https://www.imdb.com/title/${data.imdb}`]
                : [],
        });

        movie.setRelationModels('actions', []);
        movie.createdAt = checkedAt;
        movie.updatedAt = checkedAt;

        if (data.status === Status.Watched)
            movie.watch(checkedAt);

        return movie;
    }

}

export default new TVisoMoviesParser();
