import { getTrackedModels, loadTrackedModels } from '@aerogel/plugin-solid';
import type { ModelWithUrl } from 'soukai-bis';

import type { Media } from '@/lib/media';
import List from '@lists/models/List';

async function listsWith(media: Media): Promise<List[]> {
    await loadTrackedModels(List);

    return getTrackedModels(List).filter((list) => list.has(media));
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
