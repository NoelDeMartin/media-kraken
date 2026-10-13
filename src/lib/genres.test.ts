import { describe, expect, it } from 'vite-plus/test';

import { genreKeyFromUrl, genreKeysFromUrls, keywordGenreUrls } from './genres';

describe('Genres', () => {
    it('Parses genre keys from urls', () => {
        expect(genreKeyFromUrl('https://www.themoviedb.org/genre/16')).toBe('tmdb:16');
        expect(genreKeyFromUrl('http://www.wikidata.org/entity/Q1107')).toBe('wikidata:Q1107');
        expect(genreKeyFromUrl('https://example.com/genre/16')).toBeNull();
    });

    it('Resolves equivalent genres', () => {
        const urls = ['https://www.themoviedb.org/genre/10765', 'https://www.themoviedb.org/genre/878'];

        expect(genreKeysFromUrls(urls)).toEqual(['tmdb:878']);
    });

    it('Removes duplicated genres', () => {
        const urls = [
            'https://www.themoviedb.org/genre/16',
            'https://www.themoviedb.org/genre/16/',
            'https://www.themoviedb.org/genre/10765',
            'https://www.themoviedb.org/genre/878',
        ];

        expect(genreKeysFromUrls(urls)).toEqual(['tmdb:16', 'tmdb:878']);
    });

    it('Detects genres from keywords', () => {
        expect(keywordGenreUrls(['witch', 'Anime'])).toEqual(['http://www.wikidata.org/entity/Q1107']);
        expect(keywordGenreUrls(['jukebox musical'])).toEqual(['http://www.wikidata.org/entity/Q842256']);
        expect(keywordGenreUrls(['christmas spirit'])).toEqual(['http://www.wikidata.org/entity/Q28026639']);
        expect(keywordGenreUrls(['post-apocalyptic future'])).toEqual(['http://www.wikidata.org/entity/Q1341051']);
        expect(keywordGenreUrls(['claymation'])).toEqual(['http://www.wikidata.org/entity/Q18089587']);
    });

    it('Detects genres from exact keywords', () => {
        expect(keywordGenreUrls(['Prison'])).toEqual(['http://www.wikidata.org/entity/Q586250']);
        expect(keywordGenreUrls(['artificial intelligence (a.i.)'])).toEqual([
            'http://www.wikidata.org/entity/Q25933185',
        ]);
        expect(keywordGenreUrls(['giant robot'])).toEqual(['http://www.wikidata.org/entity/Q4292083']);
        expect(keywordGenreUrls(["women's prison"])).toEqual(['http://www.wikidata.org/entity/Q586250']);
        expect(keywordGenreUrls(['prison guard', 'sports car'])).toEqual([]);
        expect(keywordGenreUrls(['animated', 'animal'])).toEqual([]);
    });
});
