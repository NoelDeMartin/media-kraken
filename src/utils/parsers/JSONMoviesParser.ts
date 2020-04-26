import Movie, { MovieJSON } from '@/models/soukai/Movie';

import MediaValidationError from '@/errors/MediaValidationError';

import Obj from '@/utils/Obj';
import Time from '@/utils/Time';

import { MediaParser } from '@/utils/parsers';

type Data = MovieJSON;

class JSONMoviesParser implements MediaParser<Data, Movie> {

    public validate(data: any): void {
        if (
            typeof data.title !== 'string' ||
            ('description' in data && typeof data.description !== 'string') ||
            ('releaseDate' in data && !Time.isValidDateString(data.releaseDate)) ||
            ('posterUrl' in data && (typeof data.posterUrl !== 'string' || !data.posterUrl.startsWith('http'))) ||
            (
                'externalUrls' in data && (
                    !Array.isArray(data.externalUrls) ||
                    data.externalUrls.find((url: any) => typeof url !== 'string') ||
                    data.externalUrls.find((url: string) => !url.startsWith('http'))
                )
            ) ||
            ('watchedAt' in data && !Time.isValidDateString(data.watchedAt))
        )
            throw new MediaValidationError(['Invalid format']);
    }

    public parse(data: Data): Movie {
        const movie = new Movie(Obj.only(data, ['title', 'description', 'releaseDate', 'posterUrl', 'externalUrls']));

        movie.setRelationModels('actions', []);

        if (data.watchedAt)
            movie.watch(new Date(data.watchedAt));

        return movie;
    }

}

export default new JSONMoviesParser();
