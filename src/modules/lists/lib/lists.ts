import { translate, UI } from '@aerogel/core';
import { getTrackedModels, loadTrackedModels } from '@aerogel/plugin-solid';

import type { Media } from '@/lib/media';
import List from '@lists/models/List';

async function listsWith(media: Media): Promise<List[]> {
    await loadTrackedModels(List);

    return getTrackedModels(List).filter((list) => list.has(media));
}

export async function promptListName(
    options: {
        title?: string;
        message?: string;
        acceptText?: string;
        defaultValue?: string;
    } = {},
): Promise<string | null> {
    const name = await UI.prompt(
        options.title ?? translate('lists.create.title'),
        options.message ?? translate('lists.create.message'),
        {
            label: translate('lists.name'),
            placeholder: translate('lists.namePlaceholder'),
            acceptText: options.acceptText ?? translate('lists.create.accept'),
            defaultValue: options.defaultValue,
        },
    );

    return name || null;
}

export async function removeFromLists(media: Media): Promise<void> {
    for (const list of await listsWith(media)) {
        await list.remove(media);
    }
}

export async function replaceInLists(original: Media, replacement: Media): Promise<void> {
    for (const list of await listsWith(original)) {
        await list.replace(original, replacement);
    }
}
