import { findExternalId, parseTmdbId } from '@/lib/domains';
import TMDB, { type TMDBPerson } from '@/services/TMDB';

import Model from './Person.schema';

export default class Person extends Model {
    static fromTMDB(person: TMDBPerson, options: { mintUrl?: boolean } = {}): Person {
        const instance = new Person({
            name: person.name,
            externalUrls: [TMDB.personUrl(person)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get tmdbId(): number | null {
        return findExternalId('https://www.themoviedb.org/person/', this.externalUrls, parseTmdbId);
    }
}
