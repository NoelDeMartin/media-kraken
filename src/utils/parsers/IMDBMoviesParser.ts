import MediaValidationError from '@/errors/MediaValidationError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';

interface Data {
    imdb: string;
}

class IMDBMoviesParser implements MediaParser<Data, Movie> {

    public async validate(data: Data): Promise<void> {
        if (typeof data.imdb !== 'string')
            throw new MediaValidationError(['Invalid format']);
    }

    public async parse(data: Data): Promise<Movie> {
        const movie = new Movie({
            title: '',
            externalUrls: [`https://www.imdb.com/title/${data.imdb}`],
        });

        movie.setRelationModels('actions', []);

        return movie;
    }

}

export default new IMDBMoviesParser();
