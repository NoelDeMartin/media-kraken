import { Cloud } from '@aerogel/plugin-local-first';
import { Solid } from '@aerogel/plugin-solid';
import { SolidDocumentPermissions } from '@noeldemartin/solid-utils';
import { arrayFilter } from '@noeldemartin/utils';
import { TypeRegistration, isLocalUrl } from 'soukai-bis';
import type { ModelWithUrl, TypeIndex } from 'soukai-bis';

import { findMedia } from '@lists/lib/lists';
import List from '@lists/models/List';

export type ListVisibility = 'public' | 'unlisted' | 'private';

function remoteList(list: ModelWithUrl<List>): ModelWithUrl<List> {
    const RemoteList = class extends List {};

    RemoteList.setEngine(Solid.requireEngine());

    return new RemoteList({ url: list.url, name: list.name }, { exists: true }) as ModelWithUrl<List>;
}

function isPublicRegistration(registration: TypeRegistration, list: ModelWithUrl<List>): boolean {
    return registration.instance === list.url && registration.registers(List);
}

async function findPublicTypeIndexes(): Promise<TypeIndex[]> {
    const typeIndexes = await Solid.findPublicTypeIndexes();

    await Promise.all(typeIndexes.map((typeIndex) => typeIndex.loadRelationIfUnloaded('registrations')));

    return typeIndexes;
}

async function isListed(list: ModelWithUrl<List>): Promise<boolean> {
    const typeIndexes = await findPublicTypeIndexes();

    return typeIndexes.some((typeIndex) =>
        typeIndex.registrations?.some((registration) => isPublicRegistration(registration, list)),
    );
}

async function publishList(list: ModelWithUrl<List>): Promise<void> {
    if (await isListed(list)) {
        return;
    }

    const typeIndex = await Solid.findOrCreatePublicTypeIndex();
    const registration = new TypeRegistration({
        forClass: List.schema.rdfClasses.map((rdfClass) => rdfClass.value),
        instance: list.url,
    });

    await typeIndex.loadRelationIfUnloaded('registrations');

    typeIndex.relatedRegistrations.attach(registration);

    await typeIndex.relatedRegistrations.save(registration);
}

export async function unpublishList(list: ModelWithUrl<List>): Promise<void> {
    for (const typeIndex of await findPublicTypeIndexes()) {
        const registrations =
            typeIndex.registrations?.filter((registration) => isPublicRegistration(registration, list)) ?? [];

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
    const permissionsList = remoteList(list);

    await permissionsList.fetchPermissions();

    if (permissionsList.isPrivate()) {
        return 'private';
    }

    return (await isListed(list)) ? 'public' : 'unlisted';
}

export async function updateListVisibility(list: ModelWithUrl<List>, visibility: ListVisibility): Promise<void> {
    if (visibility !== 'private') {
        // Lists created before items stored media details need them before visitors can read the list.
        await list.loadRelationIfUnloaded('items');
        await list.updateItemDetails(arrayFilter(await Promise.all(list.mediaUrls.map(findMedia))));
        await Cloud.sync(list);
    }

    await remoteList(list).updatePublicPermissions(visibility === 'private' ? [] : [SolidDocumentPermissions.Read]);

    if (visibility === 'public') {
        await publishList(list);

        return;
    }

    await unpublishList(list);
}
