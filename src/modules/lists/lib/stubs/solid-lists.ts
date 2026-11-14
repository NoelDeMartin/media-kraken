import { defineStub, type StubDefinition } from '@/lib/stubs/helpers';
import { attachStubItem } from '@lists/lib/stubs/lists';
import List from '@lists/models/List';
import movies from '@movies/lib/stubs/solid-movies';
import shows from '@shows/lib/stubs/solid-shows';

function list(slug: string, name: string, mediaUrls: string[]): List {
    const instance = new List({ url: `local://lists/${slug}#it`, name });
    const media = [...movies.all, ...shows.all];

    for (const mediaUrl of mediaUrls) {
        attachStubItem(
            instance,
            mediaUrl,
            media.find(({ url }) => url === mediaUrl),
        );
    }

    return instance;
}

export default defineStub<StubDefinition<string, List>>([
    [
        'Favorites',
        list('favorites', 'Favorites', [
            'local://movies/the-substance-2024#it',
            'local://shows/severance-2022/info#it',
            'local://movies/the-tale-of-the-princess-kaguya-2013#it',
            'local://shows/pluribus-2025/info#it',
            'local://movies/onibaba-1964#it',
            'local://shows/succession-2018/info#it',
        ]),
    ],
    [
        'Halloween marathon',
        list('halloween-marathon', 'Halloween marathon', [
            'local://movies/onibaba-1964#it',
            'local://movies/the-testament-of-dr-mabuse-1933#it',
        ]),
    ],
    [
        'Missing posters',
        list('missing-posters', 'Missing posters', [
            'local://movies/missing-poster#it',
            'local://movies/invalid-poster#it',
            'local://movies/all-that-jazz-1979#it',
        ]),
    ],
    [
        'Long name',
        list(
            'long-name',
            'Movies to watch on a rainy Sunday afternoon with a big bowl of popcorn and no plans at all',
            ['local://shows/freaks-and-geeks-1999/info#it'],
        ),
    ],
    ['Empty', list('empty', 'Empty list', [])],
]);
