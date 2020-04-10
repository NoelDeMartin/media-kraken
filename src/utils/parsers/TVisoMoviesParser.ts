import MediaValidationError from '@/errors/MediaValidationError';
import UnsuitableMediaError from '@/errors/IgnoreMediaError';

import Arr from '@/utils/Arr';
import Time from '@/utils/Time';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/services/Media';

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

    public validate(data: any): void {
        if (data.type !== DataMediaType.Movie)
            throw new UnsuitableMediaError('Not a movie');

        if (
            typeof data.title !== 'string' ||
            (data.imdb !== null && typeof data.imdb !== 'string') ||
            !Arr.contains(Object.values(Status), data.status) ||
            !Time.isValidDateString(data.checkedDate)
        )
            throw new MediaValidationError(['Invalid format']);
    }

    public parse(data: Data): Movie {
        const movie = new Movie({
            title: data.title,
            externalUrls: data.imdb !== null
                ? [`https://www.imdb.com/title/${data.imdb}`]
                : [],
        });

        movie.setRelationModels('actions', []);

        switch (data.status) {
            case Status.Pending:
                movie.createdAt = data.checkedDate;
                break;
            case Status.Watched:
                movie.watch(data.checkedDate);
                break;
        }

        return movie;
    }

}

export default new TVisoMoviesParser();
