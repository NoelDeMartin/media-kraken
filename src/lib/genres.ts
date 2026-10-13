import { arrayUnique, escapeRegexText, isTruthy, objectEntries } from '@noeldemartin/utils';

import { parseTmdbId, TMDB_GENRE_URL_PREFIX, TMDB_GENRES, tmdbGenreUrl, type KnownTMDBGenreName } from '@/lib/tmdb';

const WIKIDATA_ENTITY_URL_PREFIX = 'http://www.wikidata.org/entity/';

const WIKIDATA_GENRES = {
    'Artificial Intelligence': { id: 'Q25933185', keywords: { exact: ['artificial intelligence (a.i.)'] } },
    'Found Footage': { id: 'Q3272147', keywords: { partial: ['found footage'] } },
    'Martial Arts': { id: 'Q1033891', keywords: { partial: ['martial arts'] } },
    'Post-apocalyptic': { id: 'Q1341051', keywords: { partial: ['post-apocalyptic'] } },
    'Stop Motion': { id: 'Q18089587', keywords: { partial: ['stop motion', 'claymation'] } },
    'Time Travel': { id: 'Q104765957', keywords: { partial: ['time travel'] } },
    Anime: { id: 'Q1107', keywords: { partial: ['anime'] } },
    Biopic: { id: 'Q645928', keywords: { partial: ['biography'] } },
    Christmas: { id: 'Q28026639', keywords: { partial: ['christmas'] } },
    Dystopia: { id: 'Q20443008', keywords: { partial: ['dystopia'] } },
    Heist: { id: 'Q496523', keywords: { partial: ['heist'] } },
    Mecha: { id: 'Q4292083', keywords: { exact: ['mecha', 'giant robot', 'piloted robot'] } },
    Musical: { id: 'Q842256', keywords: { partial: ['musical'] } },
    Prison: {
        id: 'Q586250',
        keywords: { exact: ['prison', 'prison escape', 'prison life', 'prison drama', "women's prison"] },
    },
    Slasher: { id: 'Q853630', keywords: { partial: ['slasher'] } },
    Sports: { id: 'Q1339864', keywords: { exact: ['sports', 'sport', 'sports drama'] } },
    Spy: { id: 'Q2297927', keywords: { partial: ['spy'] } },
    Superhero: { id: 'Q1535153', keywords: { partial: ['superhero'] } },
    Vampire: { id: 'Q2137852', keywords: { partial: ['vampire'] } },
    Zombie: { id: 'Q3072049', keywords: { partial: ['zombie'] } },
} as const satisfies Record<string, WikidataGenre>;

const GENRE_EQUIVALENTS: Partial<Record<KnownGenreName, KnownGenreName>> = {
    'Sci-Fi & Fantasy': 'Science Fiction',
};

const GENRE_KEY_EQUIVALENTS = new Map(
    objectEntries(GENRE_EQUIVALENTS).map(([genre, equivalent]) => [genreKey(genre), genreKey(equivalent)]),
);

interface WikidataGenre {
    id: string;
    keywords: {
        exact?: readonly string[];
        partial?: readonly string[];
    };
}

export type WikidataGenreName = keyof typeof WIKIDATA_GENRES;
export type KnownGenreName = KnownTMDBGenreName | WikidataGenreName;
export type GenreKey = `tmdb:${number}` | `wikidata:${string}`;

function isWikidataGenreName(name: KnownGenreName): name is WikidataGenreName {
    return name in WIKIDATA_GENRES;
}

export function genreKey(name: KnownGenreName): GenreKey {
    return isWikidataGenreName(name) ? `wikidata:${WIKIDATA_GENRES[name].id}` : `tmdb:${TMDB_GENRES[name]}`;
}

export function genreUrl(name: KnownGenreName): string {
    return isWikidataGenreName(name)
        ? `${WIKIDATA_ENTITY_URL_PREFIX}${WIKIDATA_GENRES[name].id}`
        : tmdbGenreUrl(TMDB_GENRES[name]);
}

export function genreKeyFromUrl(url: string): GenreKey | null {
    if (url.startsWith(TMDB_GENRE_URL_PREFIX)) {
        const id = parseTmdbId(url);

        return id ? `tmdb:${id}` : null;
    }

    if (url.startsWith(WIKIDATA_ENTITY_URL_PREFIX)) {
        const id = url.slice(WIKIDATA_ENTITY_URL_PREFIX.length);

        return id ? `wikidata:${id}` : null;
    }

    return null;
}

export function genreKeysFromUrls(urls: string[]): GenreKey[] {
    return arrayUnique(
        urls
            .map(genreKeyFromUrl)
            .filter(isTruthy)
            .map((key) => GENRE_KEY_EQUIVALENTS.get(key) ?? key),
    );
}

export function tmdbGenreId(key: GenreKey): number | null {
    return key.startsWith('tmdb:') ? Number(key.slice(5)) : null;
}

export function wikidataGenreName(key: GenreKey): WikidataGenreName | null {
    return objectEntries(WIKIDATA_GENRES).find(([, genre]) => key === `wikidata:${genre.id}`)?.[0] ?? null;
}

function matchesKeywords(genre: WikidataGenre, keywords: string[]): boolean {
    const exactKeywords = genre.keywords.exact ?? [];
    const partialKeywords = (genre.keywords.partial ?? []).map(
        (keyword) => new RegExp(`\\b${escapeRegexText(keyword)}\\b`, 'i'),
    );

    return keywords.some(
        (keyword) =>
            exactKeywords.includes(keyword.toLowerCase()) || partialKeywords.some((pattern) => pattern.test(keyword)),
    );
}

export function keywordGenreUrls(keywords: string[]): string[] {
    return objectEntries(WIKIDATA_GENRES)
        .filter(([, genre]) => matchesKeywords(genre, keywords))
        .map(([name]) => genreUrl(name));
}
