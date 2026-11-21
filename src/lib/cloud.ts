import { translate } from '@aerogel/core';
import localFirst from '@aerogel/plugin-local-first';
import type { CloudConflict, ConflictHandlerResult, DeletionConflictPrompt } from '@aerogel/plugin-local-first';
import type { SolidDocument } from '@noeldemartin/solid-utils';
import { stringToCamelCase } from '@noeldemartin/utils';
import type { DeletionConflict } from 'soukai-bis';

import { mediaDisplayName } from '@/lib/media';
import type { Media } from '@/lib/media';
import List from '@lists/models/List';
import ListItem from '@lists/models/ListItem';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

function getConflictDocument(conflict: DeletionConflict): SolidDocument {
    return conflict.type === 'deleted-remotely' ? conflict.localDocument : conflict.remoteDocument;
}

function getMediaType(media: Media): 'movie' | 'show' {
    return media instanceof Movie ? 'movie' : 'show';
}

async function findDocumentMedia(document: SolidDocument, url?: string): Promise<Media | null> {
    const [movie] = await Movie.createManyFromDocument(document, { includeSoftDeleted: true });
    const [show] = await Show.createManyFromDocument(document, { includeSoftDeleted: true });
    const media = [movie, show].filter((documentMedia) => !!documentMedia);

    return (url ? media.find((documentMedia) => documentMedia.url === url) : media[0]) ?? null;
}

async function getListItemPrompt(
    conflict: DeletionConflict,
    item: ListItem,
): Promise<DeletionConflictPrompt | undefined> {
    const document = getConflictDocument(conflict);
    const [list] = await List.createManyFromDocument(document, { includeSoftDeleted: true });
    const media = item.media ?? (await findDocumentMedia(document, item.mediaUrl));

    if (!list || !media) {
        return undefined;
    }

    return {
        message: translate(`cloud.conflicts.listItem.${stringToCamelCase(conflict.type)}`, {
            name: mediaDisplayName(media),
            list: list.name,
        }),
        deleteText: translate('cloud.conflicts.listItem.remove'),
        restoreText: translate('cloud.conflicts.listItem.keep'),
    };
}

async function handleConflict(conflict: CloudConflict): Promise<ConflictHandlerResult> {
    if (conflict.resourceType !== 'document') {
        return;
    }

    const conflictType = stringToCamelCase(conflict.type);

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
