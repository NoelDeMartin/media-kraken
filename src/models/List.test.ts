import { required } from '@noeldemartin/utils';
import { InMemoryEngine, bootCoreModels, bootModels, setEngine } from 'soukai-bis';
import { beforeEach, describe, expect, it } from 'vite-plus/test';

import List from '@/models/List';
import ListItem from '@/models/ListItem';
import Movie from '@/models/Movie';
import PerformanceRole from '@/models/PerformanceRole';
import Person from '@/models/Person';
import Show from '@/models/Show';
import WatchAction from '@/models/WatchAction';

describe('List model', () => {
    let alien: Movie;
    let jaws: Movie;
    let scream: Movie;

    function titles(list: List): (string | undefined)[] {
        return list.mediaUrls.map((url) => [alien, jaws, scream].find((movie) => movie.url === url)?.title);
    }

    function item(list: List, movie: Movie): ListItem {
        return required(list.sortedItems.find(({ mediaUrl }) => mediaUrl === movie.url));
    }

    async function createList(movies: Movie[]): Promise<List> {
        const list = await List.create({ name: 'Favorites' });

        for (const movie of movies) {
            await list.add(movie);
        }

        return list;
    }

    beforeEach(() => {
        bootCoreModels({ reset: true });
        bootModels({ List, ListItem, Movie, PerformanceRole, Person, Show, WatchAction }, { reset: true });
        setEngine(new InMemoryEngine());

        alien = new Movie({ url: 'solid://movies/alien#it', title: 'Alien' });
        jaws = new Movie({ url: 'solid://movies/jaws#it', title: 'Jaws' });
        scream = new Movie({ url: 'solid://movies/scream#it', title: 'Scream' });
    });

    it('Adds media once', async () => {
        const list = await createList([alien, jaws, alien]);

        expect(titles(list)).toEqual(['Alien', 'Jaws']);
        expect(list.sortedItems.map((item) => item.position)).toEqual([1, 2]);
    });

    it('Moves items down and up', async () => {
        const list = await createList([alien, jaws, scream]);

        await list.move(item(list, alien), item(list, scream));

        expect(titles(list)).toEqual(['Jaws', 'Scream', 'Alien']);

        await list.move(item(list, alien), item(list, jaws));

        const freshList = await List.findOrFail(list.requireUrl());

        expect(titles(list)).toEqual(['Alien', 'Jaws', 'Scream']);
        expect(titles(freshList)).toEqual(['Alien', 'Jaws', 'Scream']);
        expect(freshList.sortedItems.map((item) => item.position)).toEqual([1, 2, 3]);
    });

    it('Ignores moving items onto themselves', async () => {
        const list = await createList([alien, jaws]);

        await list.move(item(list, alien), item(list, alien));

        expect(titles(list)).toEqual(['Alien', 'Jaws']);
    });

    it('Removes media', async () => {
        const list = await createList([alien, jaws, scream]);
        const jawsItemUrl = list.sortedItems[1]?.url;

        await list.remove(jaws);

        const freshList = await List.findOrFail(list.requireUrl());

        expect(titles(list)).toEqual(['Alien', 'Scream']);
        expect(list.itemUrls).not.toContain(jawsItemUrl);
        expect(freshList.itemUrls).toHaveLength(2);
        expect(titles(freshList)).toEqual(['Alien', 'Scream']);
    });

    it('Removes items', async () => {
        const list = await createList([alien, jaws, scream]);

        await list.removeItem(item(list, scream));

        const freshList = await List.findOrFail(list.requireUrl());

        expect(titles(list)).toEqual(['Alien', 'Jaws']);
        expect(titles(freshList)).toEqual(['Alien', 'Jaws']);
    });

    it('Replaces media', async () => {
        const list = await createList([alien, jaws]);

        await list.replace(alien, scream);

        const freshList = await List.findOrFail(list.requireUrl());

        expect(titles(list)).toEqual(['Scream', 'Jaws']);
        expect(titles(freshList)).toEqual(['Scream', 'Jaws']);
    });

    it('Removes original when replacement is already listed', async () => {
        const list = await createList([alien, jaws]);

        await list.replace(alien, jaws);

        expect(titles(list)).toEqual(['Jaws']);
    });

    it('Keeps slug after renaming', async () => {
        const list = await createList([]);

        await list.update({ name: 'All-time favorites' });

        expect(list.slug).toEqual('favorites');
    });
});
