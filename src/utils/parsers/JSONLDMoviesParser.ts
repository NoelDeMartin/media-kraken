import MediaValidationError from '@/errors/MediaValidationError';

import Movie from '@/models/soukai/Movie';

import { MediaParser } from '@/utils/parsers';

class JSONLDMoviesParser implements MediaParser<object, Movie> {

    public async validate(data: any): Promise<void> {
        const types = data['@type'];
        const contexts = data['@context'] || {};

        if (!types)
            throw new MediaValidationError(['Invalid format, @type missing']);

        const movieType = (Array.isArray(types) ? types : [types]).find((type: string) => {
            if (type.startsWith('http'))
                return type === 'https://schema.org/Movie';

            const [prefix, name] = type.split(':');

            return name
                ? (contexts[prefix] === 'https://schema.org' && name === 'Movie')
                : (contexts['@vocab'] === 'https://schema.org/' && prefix === 'Movie');
        });

        if (!movieType)
            throw new MediaValidationError(['Invalid format, schema:Movie type is missing']);
    }

    public async parse(data: object): Promise<Movie> {
        const movie = await Movie.newFromJsonLD<Movie>(data);

        delete movie.url;

        if (movie.isRelationLoaded('actions'))
            movie.actions!.map(action => delete action.url);

        return movie;
    }

}

export default new JSONLDMoviesParser();
