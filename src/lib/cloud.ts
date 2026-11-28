import { translate } from '@aerogel/core';
import localFirst from '@aerogel/plugin-local-first';
import type { ConflictHandlerResult, ResourceConflictPrompt } from '@aerogel/plugin-local-first';
import type { SolidDocument } from '@noeldemartin/solid-utils';
import { isFileConflict } from 'soukai-bis';
import type { ResourceConflict, SyncConflict } from 'soukai-bis';

import { mediaDisplayName } from '@/lib/media';
import type { Media } from '@/lib/media';
import List from '@lists/models/List';
import ListItem from '@lists/models/ListItem';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

function getConflictDocument(conflict: ResourceConflict): SolidDocument {
    return conflict.type === 'resource-deleted-remotely' ? conflict.localDocument : conflict.remoteDocument;
}

function getConflictTranslationKey(conflict: ResourceConflict): string {
    return conflict.type === 'resource-deleted-remotely' ? 'deletedRemotely' : 'deletedLocally';
}

function getMediaType(media: Media): 'movie' | 'show' {
    return media instanceof Movie ? 'movie' : 'show';
}

async function findDocumentMedia(document: SolidDocument, url?: string): Promise<Media | null> {
    const [movie] = await Movie.fromDocument(document).all({ includeSoftDeleted: true });
    const [show] = await Show.fromDocument(document).all({ includeSoftDeleted: true });
    const media = [movie, show].filter((documentMedia) => !!documentMedia);

    return (url ? media.find((documentMedia) => documentMedia.url === url) : media[0]) ?? null;
}

async function getListItemPrompt(
    conflict: ResourceConflict,
    item: ListItem,
): Promise<ResourceConflictPrompt | undefined> {
    const document = getConflictDocument(conflict);
    const [list] = await List.fromDocument(document).all({ includeSoftDeleted: true });
    const media = item.media ?? (await findDocumentMedia(document, item.mediaUrl));

    if (!list || !media) {
        return undefined;
    }

    return {
        message: translate(`cloud.conflicts.listItem.${getConflictTranslationKey(conflict)}`, {
            name: mediaDisplayName(media),
            list: list.name,
        }),
        deleteText: translate('cloud.conflicts.listItem.remove'),
        restoreText: translate('cloud.conflicts.listItem.keep'),
    };
}

async function handleConflict(conflict: SyncConflict): Promise<ConflictHandlerResult> {
    if (isFileConflict(conflict)) {
        return;
    }

    const conflictType = getConflictTranslationKey(conflict);

    if (conflict.model instanceof Movie || conflict.model instanceof Show) {
        return {
            message: translate(`cloud.conflicts.${getMediaType(conflict.model)}.${conflictType}`, {
                name: mediaDisplayName(conflict.model),
            }),
        };
    }

    if (conflict.model instanceof List) {
        return { message: translate(`cloud.conflicts.list.${conflictType}`, { name: conflict.model.name }) };
    }

    if (conflict.model instanceof ListItem) {
        return getListItemPrompt(conflict, conflict.model);
    }

    const media = conflict.model && (await findDocumentMedia(getConflictDocument(conflict)));

    if (!media) {
        return undefined;
    }

    return {
        message: translate(`cloud.conflicts.${getMediaType(media)}.details.${conflictType}`, {
            name: mediaDisplayName(media),
        }),
    };
}

// oxlint-disable-next-line typescript/explicit-module-boundary-types
export default function () {
    return localFirst({ handleConflict });
}
