import { arraySorted, DAY_MILLISECONDS, required } from '@noeldemartin/utils';
import type { ModelWithUrl } from 'soukai-bis';
import { onMounted, shallowRef, type Ref } from 'vue';

import movieFixtures from '@/lib/fixtures/tmdb/movies.json';
import showFixtures from '@/lib/fixtures/tmdb/shows.json';
import { getStatsSnapshot, type StatsSnapshot } from '@/pages/stats/utils/snapshot';
import Catalog from '@/services/Catalog';
import type { TMDBMovie, TMDBShow } from '@/services/TMDB';
import List from '@lists/models/List';
import type Movie from '@movies/models/Movie';
import type { MovieWatchingStatus } from '@movies/models/WatchAction';
import type Show from '@shows/models/Show';
import type { ShowWatchingStatus } from '@shows/models/ShowWatching';

export interface SampleCollection {
    movies: ModelWithUrl<Movie>[];
    shows: ModelWithUrl<Show>[];
    lists: ModelWithUrl<List>[];
}

export const EMPTY_COLLECTION: SampleCollection = { movies: [], shows: [], lists: [] };

interface SampleMovie {
    status?: Exclude<MovieWatchingStatus, 'pending'>;
    date?: string;
    rewatches?: string[];
    rating?: number;
    notes?: string;
}

interface SampleShow {
    status: ShowWatchingStatus;
    watchedEpisodes?: number;
    upcomingEpisode?: boolean;
    rating?: number;
    notes?: string;
}

const MOVIES: Record<string, SampleMovie> = {
    'The Substance': {
        status: 'watched',
        date: '2024-10-05',
        rating: 8,
        notes: 'Body horror at its finest. **Do not** watch while eating.\n\n- Incredible practical effects\n- That ending!',
    },
    'The Tale of The Princess Kaguya': {
        status: 'watched',
        date: '2023-12-24',
        rewatches: ['2024-12-24', '2025-12-24'],
        rating: 10,
    },
    'All That Jazz': {},
    Symbol: { status: 'watched', date: '2023-04-01', rating: 7 },
    Onibaba: {},
    'The Testament of Dr. Mabuse': { status: 'dropped', date: '2025-03-10' },
    'The Matrix': { status: 'watched', date: '2019-03-31', rating: 9 },
    Parasite: { status: 'watched', date: '2020-02-10', rating: 9 },
    'Spirited Away': { status: 'watched', date: '2021-08-14', rewatches: ['2025-08-14'], rating: 10 },
    'Seven Samurai': { notes: 'Make sure to block an entire afternoon, it is 3h 27m long.' },
    'Pulp Fiction': { status: 'watched', date: '2018-06-02', rating: 7 },
    Alien: { status: 'watched', date: '2024-10-31', rating: 8 },
    'Your Name.': { status: 'watched', date: '2022-02-14', rating: 9 },
    Whiplash: { status: 'watched', date: '2023-09-09', rating: 9 },
    'Eternal Sunshine of the Spotless Mind': {},
    '2001: A Space Odyssey': { status: 'dropped', date: '2022-05-05', rating: 4 },
    'Come and See': {},
    'The Shining': { status: 'watched', date: '2025-10-31', rating: 8 },
};

const SHOWS: Record<string, SampleShow> = {
    Severance: {
        status: 'watching',
        watchedEpisodes: 16,
        rating: 9,
        notes: 'Praise Kier.',
    },
    Pluribus: { status: 'watching', watchedEpisodes: 8, upcomingEpisode: true },
    Shōgun: { status: 'watching', watchedEpisodes: 6, rating: 8 },
    'Freaks and Geeks': { status: 'completed', watchedEpisodes: 18, rating: 10 },
    Succession: { status: 'dropped', rating: 7 },
    'Twin Peaks': { status: 'pending' },
    'LEGO ONE PIECE': { status: 'pending' },
};

const LISTS: { name: string; description?: string; media: string[] }[] = [
    {
        name: 'Favorites',
        description: 'The best of the best, in **no particular order**.',
        media: [
            'The Tale of The Princess Kaguya',
            'Freaks and Geeks',
            'Spirited Away',
            'Severance',
            'Parasite',
            'The Substance',
        ],
    },
    { name: 'Halloween marathon', media: ['Alien', 'The Shining', 'Onibaba', 'The Substance'] },
    { name: 'Movie night with friends', media: [] },
];

function fixture<T extends { title?: string; name?: string }>(fixtures: T[], name: string): T {
    return required(fixtures.find((media) => (media.title ?? media.name) === name));
}

async function seedMovie(title: string, sample: SampleMovie): Promise<ModelWithUrl<Movie>> {
    const tmdbMovie = fixture(movieFixtures as unknown as TMDBMovie[], title);
    const movie = await Catalog.importMovieFromTMDB(tmdbMovie, { rating: sample.rating, notes: sample.notes });

    if (sample.status) {
        await movie.updateWatchingStatus(sample.status, sample.date ? new Date(sample.date) : undefined);
    }

    if (sample.rewatches?.length) {
        sample.rewatches.forEach((date) => movie.addWatch(new Date(date)));

        await movie.save();
    }

    return movie;
}

async function seedShow(name: string, sample: SampleShow): Promise<ModelWithUrl<Show>> {
    const tmdbShow = fixture(showFixtures as unknown as TMDBShow[], name);
    const show = await Catalog.importShowFromTMDB(tmdbShow, {
        watchingStatus: sample.status,
        rating: sample.rating,
        notes: sample.notes,
    });
    const episodes = arraySorted(show.seasons ?? [], 'number').flatMap((season) =>
        arraySorted(season.episodes ?? [], 'number'),
    );

    await Promise.all(episodes.slice(0, sample.watchedEpisodes ?? 0).map((episode) => episode.watch()));

    if (sample.upcomingEpisode) {
        await episodes.at(-1)?.update({ publishedAt: new Date(Date.now() + 3 * DAY_MILLISECONDS) });
    }

    await show.pendingEpisodes.updateValue({ refresh: true, loadRelations: true });

    return show;
}

export async function seedSampleCollection(): Promise<SampleCollection> {
    const movies = await Promise.all(Object.entries(MOVIES).map(([title, sample]) => seedMovie(title, sample)));
    const shows = [];

    for (const [name, sample] of Object.entries(SHOWS)) {
        shows.push(await seedShow(name, sample));
    }

    const media = [...movies, ...shows];
    const lists = [];

    for (const { name, description, media: names } of LISTS) {
        const list = await List.create({ name, description });

        for (const [index, mediaName] of names.entries()) {
            const mediaUrl = required(
                media.find((item) => ('title' in item ? item.title : item.name) === mediaName),
            ).url;

            await list.relatedItems.create({ mediaUrl, position: index + 1 });
        }

        lists.push(list);
    }

    return { movies, shows, lists };
}

export function useSampleCollection(): Readonly<Ref<SampleCollection | null>> {
    const collection = shallowRef<SampleCollection | null>(null);

    onMounted(async () => (collection.value = await seedSampleCollection()));

    return collection;
}

export function sampleMovie(collection: SampleCollection, title: string): ModelWithUrl<Movie> {
    return required(collection.movies.find((movie) => movie.title === title));
}

export function sampleShow(collection: SampleCollection, name: string): ModelWithUrl<Show> {
    return required(collection.shows.find((show) => show.name === name));
}

export function sampleList(collection: SampleCollection, name: string): ModelWithUrl<List> {
    return required(collection.lists.find((list) => list.name === name));
}

export async function sampleStatsSnapshot(collection: SampleCollection): Promise<StatsSnapshot> {
    await Promise.all([
        ...collection.movies.map((movie) => movie.credits.updateValue()),
        ...collection.shows.flatMap((show) => [show.credits.updateValue(), show.watchedEpisodes.updateValue()]),
    ]);

    return getStatsSnapshot(collection.movies, collection.shows);
}

export function useSampleStatsSnapshot(): Readonly<Ref<StatsSnapshot | null>> {
    const snapshot = shallowRef<StatsSnapshot | null>(null);

    onMounted(async () => (snapshot.value = await sampleStatsSnapshot(await seedSampleCollection())));

    return snapshot;
}
