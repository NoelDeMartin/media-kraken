import { Solid } from '@aerogel/plugin-solid';
import { SolidDocumentPermissions } from '@noeldemartin/solid-utils';
import { isLocalUrl } from 'soukai-bis';
import type { ModelWithUrl, TypeRegistration } from 'soukai-bis';

import List from '@lists/models/List';

export type ListVisibility = 'public' | 'unlisted' | 'private';

function isListRegistration(registration: TypeRegistration, list: ModelWithUrl<List>): boolean {
    return registration.instance === list.url && registration.registers(List);
}

async function isListed(list: ModelWithUrl<List>): Promise<boolean> {
    const typeIndexes = await Solid.findPublicTypeIndexes();

    return typeIndexes.some((typeIndex) =>
        typeIndex.registrations?.some((registration) => isListRegistration(registration, list)),
    );
}

async function publishList(list: ModelWithUrl<List>): Promise<void> {
    if (await isListed(list)) {
        return;
    }

    const typeIndex = await Solid.findOrCreatePublicTypeIndex();

    await typeIndex.relatedRegistrations.create({
        forClass: List.schema.rdfClasses.map((rdfClass) => rdfClass.value),
        instance: list.url,
    });
}

export async function unpublishList(list: ModelWithUrl<List>): Promise<void> {
    const publicTypeIndexes = await Solid.findPublicTypeIndexes();

    for (const typeIndex of publicTypeIndexes) {
        const registrations =
            typeIndex.registrations?.filter((registration) => isListRegistration(registration, list)) ?? [];

        if (registrations.length === 0) {
            continue;
        }

        typeIndex.relatedRegistrations.detach(registrations, { delete: true });

        await typeIndex.save();
    }
}

export function canShareList(list: List): list is ModelWithUrl<List> {
    return Solid.isLoggedIn() && !!list.url && !isLocalUrl(list.url);
}

export async function fetchListVisibility(list: ModelWithUrl<List>): Promise<ListVisibility> {
    await list.fetchPermissions();

    if (list.isPrivate()) {
        return 'private';
    }

    return (await isListed(list)) ? 'public' : 'unlisted';
}

export async function updateListVisibility(list: ModelWithUrl<List>, visibility: ListVisibility): Promise<void> {
    await list.updatePublicPermissions(visibility === 'private' ? [] : [SolidDocumentPermissions.Read]);

    if (visibility === 'public') {
        await publishList(list);

        return;
    }

    await unpublishList(list);
}
