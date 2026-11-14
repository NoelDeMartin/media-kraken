import { Solid } from '@aerogel/plugin-solid';
import {
    RDFNamedNode,
    RDFQuad,
    SolidDocumentPermissions,
    SparqlUpdate,
    expandIRI,
    fetchSolidDocument,
    updateSolidDocument,
} from '@noeldemartin/solid-utils';
import { isLocalUrl } from 'soukai-bis';
import type { ModelWithUrl, TypeIndex, TypeRegistration } from 'soukai-bis';

import List from '@lists/models/List';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

const ABOUT_PREDICATE = new RDFNamedNode(expandIRI('schema:about'));

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
        forClass: List.getRdfClasses(),
        instance: list.url,
    });

    await updateSolidDocument(typeIndex.requireDocumentUrl(), new SparqlUpdate().insert(listAboutQuads(list)), {
        fetch: Solid.fetch,
    });
}

function listAboutQuads(list: ModelWithUrl<List>): RDFQuad[] {
    const listNode = new RDFNamedNode(list.url);

    return [...Movie.getRdfClasses(), ...Show.getRdfClasses()].map(
        (rdfClass) => new RDFQuad(listNode, ABOUT_PREDICATE, new RDFNamedNode(rdfClass)),
    );
}

async function removeListAbout(typeIndex: TypeIndex, list: ModelWithUrl<List>): Promise<void> {
    const url = typeIndex.requireDocumentUrl();
    const document = await fetchSolidDocument(url, { fetch: Solid.fetch });
    const update = new SparqlUpdate(document).delete(new RDFNamedNode(list.url), ABOUT_PREDICATE);

    await updateSolidDocument(url, update, { fetch: Solid.fetch });
}

export type ListVisibility = 'public' | 'unlisted' | 'private';

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
        await removeListAbout(typeIndex, list);
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
