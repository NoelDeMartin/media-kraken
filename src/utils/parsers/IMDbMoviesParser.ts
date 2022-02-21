import TheMovieDBApi from '@/api/TheMovieDBApi';

import Services from '@/services';

import MediaValidationError from '@/errors/MediaValidationError';
import UnsuitableMediaError from '@/errors/UnsuitableMediaError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';
import TMDBResolver from '@/utils/media/TMDBResolver';

interface Data {
    imdb: string;
}

class IMDbMoviesParser implements MediaParser<Data, Movie> {

    public async validate(data: Data): Promise<void> {
        if (typeof data.imdb !== 'string')
            throw new MediaValidationError(['Invalid format']);

        if (await this.alreadyInCollection(data))
            return;

        const model = await TMDBResolver.resolveImdbId(data.imdb);
        if (model === null)
            throw new MediaValidationError(['This movie could not be resolved']);
        else if (!TheMovieDBApi.isMovie(model))
            throw new UnsuitableMediaError('Not a movie');
    }

    public async parse(data: Data): Promise<Movie> {
        const movie = new Movie({
            title: '',
            externalUrls: [`https://www.imdb.com/title/${data.imdb}`],
        });

        movie.setRelationModels('actions', []);

        return movie;
    }

    private async alreadyInCollection(data: Data): Promise<boolean> {
        const tmpMovie = await this.parse(data);
        const collectionMovie = Services.$media.movies.find(collectionMovie => collectionMovie.is(tmpMovie));

        return !!collectionMovie;
    }

}

export default new IMDbMoviesParser();
