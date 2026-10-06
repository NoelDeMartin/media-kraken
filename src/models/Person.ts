import { findExternalId } from '@/lib/domains';
import { parseTmdbId, tmdbPersonUrl, tmdbProfileUrl } from '@/lib/tmdb';
import type { TMDBPerson } from '@/services/TMDB';

import Model from './Person.schema';

const TMDB_PERSON_URL_PREFIX = 'https://www.themoviedb.org/person/';

export default class Person extends Model {
    static fromTMDB(person: TMDBPerson, options: { mintUrl?: boolean } = {}): Person {
        const instance = new Person({
            name: person.name,
            imageUrl: tmdbProfileUrl(person.profile_path),
            externalUrls: [tmdbPersonUrl(person.id)],
        });

        if (options.mintUrl) {
            instance.mintUrl();
        }

        return instance;
    }

    public get tmdbUrl(): string | null {
        return this.externalUrls.find((url) => url.startsWith(TMDB_PERSON_URL_PREFIX)) ?? null;
    }

    public get tmdbId(): number | null {
        return findExternalId(TMDB_PERSON_URL_PREFIX, this.externalUrls, parseTmdbId);
    }
}
