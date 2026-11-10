import { fail, required } from '@noeldemartin/utils';
import { requireEngine } from 'soukai-bis';
import type { ModelWithUrl } from 'soukai-bis';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import Movie from '@movies/models/Movie';

import List from './List';
import type ListItem from './ListItem';

describe('List model', () => {
    let alien: ModelWithUrl<Movie>;
    let jaws: ModelWithUrl<Movie>;
    let scream: ModelWithUrl<Movie>;

    function newMovie(url: string, title: string): ModelWithUrl<Movie> {
        const instance = new Movie({ url, title });

        return instance.hasUrl() ? instance : fail(`Missing url for ${title}`);
    }

    function titles(list: List): (string | undefined)[] {
        return list.mediaUrls.map((url) => [alien, jaws, scream].find((movie) => movie.url === url)?.title);
    }

    function item(list: List, movie: Movie): ListItem {
        return required(list.sortedItems.find(({ mediaUrl }) => mediaUrl === movie.url));
    }

    async function createList(movies: ModelWithUrl<Movie>[]): Promise<ModelWithUrl<List>> {
        const list = await List.create({ name: 'Favorites' });

        for (const movie of movies) {
            await list.add(movie);
        }

        return list;
    }

    beforeEach(() => {
        alien = newMovie('local://movies/alien#it', 'Alien');
        jaws = newMovie('local://movies/jaws#it', 'Jaws');
        scream = newMovie('local://movies/scream#it', 'Scream');
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

        const freshList = await List.findOrFail(list.url);

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

        const freshList = await List.findOrFail(list.url);

        expect(titles(list)).toEqual(['Alien', 'Scream']);
        expect(list.itemUrls).not.toContain(jawsItemUrl);
        expect(freshList.itemUrls).toHaveLength(2);
        expect(titles(freshList)).toEqual(['Alien', 'Scream']);
    });

    it('Removes items', async () => {
        const list = await createList([alien, jaws, scream]);

        await list.removeItem(item(list, scream));

        const freshList = await List.findOrFail(list.url);

        expect(titles(list)).toEqual(['Alien', 'Jaws']);
        expect(titles(freshList)).toEqual(['Alien', 'Jaws']);
    });

    it('Replaces media', async () => {
        const list = await createList([alien, jaws]);

        await list.replace(alien, scream);

        const freshList = await List.findOrFail(list.url);

        expect(titles(list)).toEqual(['Scream', 'Jaws']);
        expect(titles(freshList)).toEqual(['Scream', 'Jaws']);
    });

    it('Removes original when replacement is already listed', async () => {
        const list = await createList([alien, jaws]);

        await list.replace(alien, jaws);

        expect(titles(list)).toEqual(['Jaws']);
    });

    it('Deletes items with the list', async () => {
        const list = await createList([alien, jaws]);
        const freshList = await List.findOrFail(list.url);
        const engine = requireEngine();
        const updateDocumentSpy = vi.spyOn(engine, 'updateDocument');
        const deleteDocumentSpy = vi.spyOn(engine, 'deleteDocument');

        await freshList.delete();

        const document = await engine.readDocument(list.requireDocumentUrl());
        const types = document.statements(undefined, 'rdf:type').map((statement) => statement.object.value);

        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(deleteDocumentSpy).not.toHaveBeenCalled();
        expect(freshList.items).toHaveLength(2);
        expect(freshList.items?.every((listItem) => !listItem.exists())).toBe(true);
        expect(types).toEqual([
            'https://vocab.noeldemartin.com/crdt/Tombstone',
            'https://vocab.noeldemartin.com/crdt/Tombstone',
            'https://vocab.noeldemartin.com/crdt/Tombstone',
        ]);
    });

    it('Keeps slug after renaming', async () => {
        const list = await createList([]);

        await list.update({ name: 'All-time favorites' });

        expect(list.slug).toEqual('favorites');
    });
});
