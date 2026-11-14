import { resetModelsState, trackModels } from '@aerogel/plugin-solid';
import { required } from '@noeldemartin/utils';
import { beforeEach, describe, expect, it } from 'vite-plus/test';

import { mediaDisplayName } from '@/lib/media';
import List from '@lists/models/List';
import Lists from '@lists/services/Lists';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

describe('Lists service', () => {
    async function freshItemsMedia(list: List) {
        return (await List.findOrFail(required(list.url))).sortedItems.map((item) => item.media);
    }

    beforeEach(async () => {
        resetModelsState();

        await Lists.launch();
        await trackModels(Show, { depth: Show.cloud.depth, lazy: true, bypassServicesCheck: true });
    });

    it('Updates media details in lists', async () => {
        const alien = await Movie.create({ title: 'Alien', externalUrls: ['https://www.themoviedb.org/movie/1'] });
        const list = await List.create({ name: 'Favorites' });

        await list.addMedia(alien);
        await alien.update({
            title: "Alien (Director's Cut)",
            posterUrl: 'https://image.tmdb.org/t/p/w500/alien.jpg',
            externalUrls: ['https://www.themoviedb.org/movie/348'],
        });

        const [media] = await freshItemsMedia(list);

        expect(media && mediaDisplayName(media)).toEqual("Alien (Director's Cut)");
        expect(media?.posterUrl).toEqual('https://image.tmdb.org/t/p/w500/alien.jpg');
        expect(media?.externalUrls).toEqual([alien.url, 'https://www.themoviedb.org/movie/348']);
    });

    it('Includes internal urls alongside external urls', async () => {
        const alien = await Movie.create({ title: 'Alien', externalUrls: ['https://www.themoviedb.org/movie/348'] });
        const list = await List.create({ name: 'Favorites' });

        await list.addMedia(alien);

        expect((await freshItemsMedia(list))[0]?.externalUrls).toEqual([
            alien.url,
            'https://www.themoviedb.org/movie/348',
        ]);

        await alien.update({ externalUrls: [] });

        expect((await freshItemsMedia(list))[0]?.externalUrls).toEqual([alien.url]);
    });

    it('Removes deleted media from lists', async () => {
        const alien = await Movie.create({ title: 'Alien', externalUrls: ['https://www.themoviedb.org/movie/348'] });
        const jaws = await Movie.create({ title: 'Jaws', externalUrls: ['https://www.themoviedb.org/movie/578'] });
        const list = await List.create({ name: 'Favorites' });

        await list.addMedia(alien);
        await list.addMedia(jaws);
        await alien.delete();

        expect((await freshItemsMedia(list)).map((media) => media && mediaDisplayName(media))).toEqual(['Jaws']);
    });

    it('Keeps replaced media in lists', async () => {
        const movie = await Movie.create({
            title: 'Twin Peaks',
            externalUrls: ['https://www.imdb.com/title/tt0098936'],
        });
        const show = await Show.create({
            name: 'Twin Peaks',
            externalUrls: ['https://www.themoviedb.org/tv/1920', 'https://www.imdb.com/title/tt0098936'],
        });
        const list = await List.create({ name: 'Favorites' });

        await list.addMedia(movie);
        await Lists.replaceInLists(movie, show);
        await movie.delete();

        const [media] = await freshItemsMedia(list);

        expect(media).toBeInstanceOf(Show);
        expect(media?.externalUrls).toEqual([
            show.url,
            'https://www.themoviedb.org/tv/1920',
            'https://www.imdb.com/title/tt0098936',
        ]);
    });
});
