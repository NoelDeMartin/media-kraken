import List from '@/models/List';

import { defineStub, type StubDefinition } from './helpers';

function list(slug: string, name: string, mediaUrls: string[]): List {
    const instance = new List({ url: `solid://lists/${slug}#it`, name });

    for (const [index, mediaUrl] of mediaUrls.entries()) {
        instance.relatedItems.attach({ mediaUrl, position: index + 1 });
    }

    return instance;
}

export default defineStub<StubDefinition<string, List>>([
    [
        'Favorites',
        list('favorites', 'Favorites', [
            'solid://movies/the-substance-2024#it',
            'solid://shows/severance-2022/info#it',
            'solid://movies/the-tale-of-the-princess-kaguya-2013#it',
            'solid://shows/pluribus-2025/info#it',
            'solid://movies/onibaba-1964#it',
            'solid://shows/succession-2018/info#it',
        ]),
    ],
    [
        'Halloween marathon',
        list('halloween-marathon', 'Halloween marathon', [
            'solid://movies/onibaba-1964#it',
            'solid://movies/the-testament-of-dr-mabuse-1933#it',
        ]),
    ],
    [
        'Missing posters',
        list('missing-posters', 'Missing posters', [
            'solid://movies/missing-poster#it',
            'solid://movies/invalid-poster#it',
            'solid://movies/all-that-jazz-1979#it',
        ]),
    ],
    [
        'Long name',
        list(
            'long-name',
            'Movies to watch on a rainy Sunday afternoon with a big bowl of popcorn and no plans at all',
            ['solid://shows/freaks-and-geeks-1999/info#it'],
        ),
    ],
    ['Empty', list('empty', 'Empty list', [])],
]);
