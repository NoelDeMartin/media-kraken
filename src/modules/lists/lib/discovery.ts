import { Solid } from '@aerogel/plugin-solid';
import { fetchSolidDocument } from '@noeldemartin/solid-utils';
import type { SolidDocument, SolidUserProfile } from '@noeldemartin/solid-utils';
import { arrayFilter, arrayUnique } from '@noeldemartin/utils';
import { TypeIndex, remote } from 'soukai-bis';
import type { ModelWithUrl } from 'soukai-bis';

import List from '@lists/models/List';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

function isMediaList(document: SolidDocument, listUrl: string): boolean {
    const mediaClasses = [...Movie.getRDFClasses(), ...Show.getRDFClasses()];

    return document
        .statements(listUrl, 'schema:about')
        .some((statement) => mediaClasses.includes(statement.object.value));
}

async function findPublicListUrls(typeIndexUrl: string): Promise<string[]> {
    const document = await fetchSolidDocument(typeIndexUrl, { fetch: Solid.fetch });
    const typeIndex = await TypeIndex.createFromDocument(document, { url: typeIndexUrl });

    return (typeIndex?.registrations ?? [])
        .flatMap((registration) =>
            registration.registersInstance() && registration.registers(List) ? [registration.instance] : [],
        )
        .filter((listUrl) => isMediaList(document, listUrl));
}

async function ensureFriendsLoaded(): Promise<void> {
    if (Solid.isLoggedIn() && !Solid.user.friends) {
        await Solid.refreshUserProfile();
    }
}

async function fetchFriendProfile(friendUrl: string): Promise<SolidUserProfile | null> {
    return Solid.getUserProfile(friendUrl, { shallow: true }).catch(() => null);
}

async function fetchReadableList(listUrl: string): Promise<ModelWithUrl<List> | null> {
    return remote(List)
        .find(listUrl)
        .catch(() => null);
}

export async function fetchFriends(): Promise<SolidUserProfile[]> {
    await ensureFriendsLoaded();

    const friends = await Promise.all((Solid.user?.friends ?? []).map(fetchFriendProfile));

    return arrayFilter(friends);
}

export async function fetchPublicLists(user: SolidUserProfile): Promise<ModelWithUrl<List>[]> {
    const listUrls = await Promise.all(user.publicTypeIndexUrls.map(findPublicListUrls));
    const lists = await Promise.all(arrayUnique(listUrls.flat()).map(fetchReadableList));

    return arrayFilter(lists);
}
