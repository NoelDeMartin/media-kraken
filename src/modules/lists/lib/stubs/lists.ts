import type { JsonLDGraph } from '@noeldemartin/solid-utils';

import movies from '@/lib/fixtures/solid/movies.jsonld';
import shows from '@/lib/fixtures/solid/shows.jsonld';
import List from '@lists/models/List';

export interface StubList {
    name: string;
    mediaUrls: string[];
}

export const documents = [...(movies as JsonLDGraph[]), ...(shows as JsonLDGraph[])];

export async function seedLists(lists: StubList[]): Promise<void> {
    for (const { name, mediaUrls } of lists) {
        const list = await List.create({ name });

        for (const [index, mediaUrl] of mediaUrls.entries()) {
            await list.relatedItems.create({ mediaUrl, position: index + 1 });
        }
    }
}
