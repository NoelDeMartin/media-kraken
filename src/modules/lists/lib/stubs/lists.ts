import type { JsonLDGraph } from '@noeldemartin/solid-utils';

import movies from '@/lib/fixtures/solid/movies.jsonld';
import shows from '@/lib/fixtures/solid/shows.jsonld';
import type { Media } from '@/lib/media';
import List from '@lists/models/List';
import type ListItem from '@lists/models/ListItem';
import Movie from '@movies/models/Movie';
import Show from '@shows/models/Show';

export interface StubList {
    name: string;
    mediaUrls: string[];
}

export const documents = [...(movies as JsonLDGraph[]), ...(shows as JsonLDGraph[])];

export function attachStubItem(list: List, mediaUrl: string, media?: Media | null): ListItem {
    return list.attachMedia(media ?? new Movie({ title: mediaUrl, externalUrls: [mediaUrl] }));
}

export async function seedLists(lists: StubList[]): Promise<void> {
    for (const { name, mediaUrls } of lists) {
        const list = await List.create({ name });

        for (const mediaUrl of mediaUrls) {
            attachStubItem(list, mediaUrl, (await Movie.find(mediaUrl)) ?? (await Show.find(mediaUrl)));
        }

        await list.save();
    }
}
