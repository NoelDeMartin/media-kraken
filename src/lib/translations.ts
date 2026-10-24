import { translate } from '@aerogel/core';
import { stringToCamelCase } from '@noeldemartin/utils';

import TMDB from '@/services/TMDB';

import { tmdbGenreId, wikidataGenreName, type GenreKey } from './genres';

export function translateGenre(genre: GenreKey): string | null {
    const tmdbId = tmdbGenreId(genre);
    const wikidataName = wikidataGenreName(genre);

    if (tmdbId) {
        return TMDB.translateGenre(tmdbId);
    }

    if (wikidataName) {
        return translate(`genres.${stringToCamelCase(wikidataName)}`);
    }

    return null;
}
