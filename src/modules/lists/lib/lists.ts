import { findTrackedModel, getTrackedModels, loadTrackedModels } from '@aerogel/plugin-solid';
import type { ModelWithUrl } from 'soukai-bis';

import type { Media } from '@/lib/media';
import List from '@lists/models/List';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

async function listsWith(media: Media): Promise<List[]> {
    await loadTrackedModels(List);

    return getTrackedModels(List).filter((list) => list.has(media));
}

export async function findMedia(url: string): Promise<Media | null> {
    if (url.startsWith(Show.defaultContainerUrl)) {
        return (await findTrackedModel(Show, url)) ?? (await findTrackedModel(Movie, url));
    }

    return (await findTrackedModel(Movie, url)) ?? (await findTrackedModel(Show, url));
}

export async function updateInLists(media: Media): Promise<void> {
    for (const list of await listsWith(media)) {
        await list.updateItemDetails([media]);
    }
}

export async function removeFromLists(media: Media): Promise<void> {
    for (const list of await listsWith(media)) {
        await list.remove(media);
    }
}

export async function replaceInLists(original: Media, replacement: ModelWithUrl<Media>): Promise<void> {
    for (const list of await listsWith(original)) {
        await list.replace(original, replacement);
    }
}
