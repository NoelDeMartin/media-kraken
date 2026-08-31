import { MediaValidationError } from '@/lib/errors';
import type { MediaParser } from '@/lib/parsers';
import Movie from '@/models/Movie';

class JSONLDMoviesParser implements MediaParser<object, Movie> {
    public async validate(data: any): Promise<void> {
        if (!data || typeof data !== 'object') {
            throw new MediaValidationError(['Invalid format']);
        }

        const types = data['@type'];
        const contexts = data['@context'] || {};

        if (!types) {
            throw new MediaValidationError(['Invalid format, @type missing']);
        }

        const typeList = Array.isArray(types) ? types : [types];
        const movieType = typeList.find((type: string) => {
            if (typeof type !== 'string') {
                return false;
            }

            if (type.startsWith('http')) {
                return type === 'https://schema.org/Movie';
            }

            const [prefix, name] = type.split(':');
            const vocab = typeof contexts === 'string' ? contexts : (contexts['@vocab'] ?? '');

            if (!prefix) {
                return false;
            }

            return name
                ? (contexts[prefix] === 'https://schema.org' || contexts[prefix] === 'https://schema.org/') &&
                      name === 'Movie'
                : vocab.startsWith('https://schema.org') && prefix === 'Movie';
        });

        if (!movieType) {
            throw new MediaValidationError(['Invalid format, schema:Movie type is missing']);
        }
    }

    public async parse(data: Record<string, any>): Promise<Movie> {
        const title = data.name || data.title || '';
        const description = data.description || undefined;
        const releaseDate = data.datePublished
            ? new Date(data.datePublished['@value'] ?? data.datePublished)
            : undefined;
        const posterUrl = data.image || undefined;
        const externalUrls = Array.isArray(data.sameAs) ? data.sameAs : data.sameAs ? [data.sameAs] : [];

        const movie = new Movie({
            title,
            description,
            releaseDate,
            posterUrl,
            externalUrls,
        });

        movie.mintUrl();

        const actions = Array.isArray(data.actions) ? data.actions : [];
        const watchAction = actions.find((a: any) => a['@type'] === 'WatchAction') as Record<string, any> | undefined;

        if (watchAction) {
            const dateVal =
                watchAction.endTime?.['@value'] ??
                watchAction.endTime ??
                watchAction.startTime?.['@value'] ??
                watchAction.startTime;
            const watchDate = dateVal ? new Date(dateVal) : new Date();

            await movie.watch(watchDate);
        }

        return movie;
    }
}

export default new JSONLDMoviesParser();
