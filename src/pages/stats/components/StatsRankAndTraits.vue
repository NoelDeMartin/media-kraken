<template>
    <StatsCard class="flex-row">
        <div class="flex flex-1 flex-col">
            <Markdown inline class="text-2xl font-medium text-gray-900" :lang-key="`stats.ranks.${rank}.title`" />
            <Markdown inline class="mt-1 leading-normal text-gray-600" :lang-key="`stats.ranks.${rank}.description`" />
        </div>
        <ul v-if="traits" class="flex w-64 flex-wrap gap-2 self-start" :aria-label="$t('stats.traits.title')">
            <li
                v-for="trait in traits"
                :key="trait.name"
                class="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm font-medium"
                :title="trait.title"
            >
                {{ $t(`stats.traits.${trait.name}`) }}
            </li>
        </ul>
    </StatsCard>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { arraySorted, isTruthy, objectEntries, required } from '@noeldemartin/utils';
import { computed } from 'vue';

import { formatGenre } from '@/lib/formatting';
import { genreKey, type GenreKey, type KnownGenreName } from '@/lib/genres';
import { getAllShows, getEpisodesWatched, getStartedShows } from '@/pages/stats/utils/snapshot';
import type { StatsSnapshot } from '@/pages/stats/utils/snapshot';

const EPISODE_WATCH_POINTS = 1 / 10;

interface Trait {
    name: string;
    title: string;
}

const { snapshot } = defineProps<{ snapshot: StatsSnapshot }>();
const watchPoints = computed(
    () => snapshot.movies.watched.length + getEpisodesWatched(snapshot) * EPISODE_WATCH_POINTS,
);

const rank = computed(() => {
    const ranks = {
        starter: 0,
        casual: 50,
        fan: 200,
        enthusiast: 500,
        cinephile: 1000,
    };

    const sortedRanks = arraySorted(
        objectEntries(ranks).map(([name, threshold]) => ({ name, threshold })),
        'threshold',
        'desc',
    );

    return required(sortedRanks.find(({ threshold }) => watchPoints.value >= threshold)).name;
});

const traits = computed(() => {
    if (rank.value === 'starter') {
        return;
    }

    return arraySorted(
        [...getGenreTraits(), ...getVarietyTraits(), ...getCompletionTraits(), ...getMediaTypeTraits()],
        'name',
    );
});

function getGenreTraits(): Trait[] {
    const genreTraits = {
        'Science Fiction': 'sciFiGeek',
        Animation: 'cartoonist',
        Crime: 'crimeJunkie',
        Documentary: 'documentarian',
        Fantasy: 'dreamer',
        Horror: 'horrorHound',
        Musical: 'singAlong',
        Mystery: 'detective',
        Romance: 'romanceJunkie',
        Western: 'gunslinger',
    } satisfies Partial<Record<KnownGenreName, string>>;

    const genreKeyTraits = new Map<GenreKey, string>(
        objectEntries(genreTraits).map(([genre, trait]) => [genreKey(genre), trait]),
    );

    return snapshot.mediaStats.all.genres
        .slice(0, 3)
        .map((genre) => {
            const trait = genreKeyTraits.get(genre.key);

            if (trait === 'cartoonist' && prefersAnime()) {
                return {
                    name: 'animaniac',
                    title: translate('stats.traits.genreTitle', { genre: formatGenre(genreKey('Anime')) }),
                };
            }

            return (
                trait && {
                    name: trait,
                    title: translate('stats.traits.genreTitle', {
                        genre: formatGenre(genre.key),
                    }),
                }
            );
        })
        .filter(isTruthy);
}

function prefersAnime(): boolean {
    const anime = genreKey('Anime');
    const animation = genreKey('Animation');
    const titles = [...snapshot.movies.watched, ...getStartedShows(snapshot)];
    const animeCount = titles.filter((title) => title.genreKeys.includes(anime)).length;
    const plainAnimationCount = titles.filter(
        (title) => title.genreKeys.includes(animation) && !title.genreKeys.includes(anime),
    ).length;

    return animeCount > plainAnimationCount;
}

function getVarietyTraits(): Trait[] {
    const genres = snapshot.mediaStats.all.genres;
    const topCount = genres.slice(0, 3).reduce((sum, genre) => sum + genre.count, 0);
    const totalCount = genres.reduce((sum, genre) => sum + genre.count, 0);

    if (topCount * 2 > totalCount) {
        return [
            {
                name: 'specialist',
                title: translate('stats.traits.specialistTitle'),
            },
        ];
    }

    return [{ name: 'omnivore', title: translate('stats.traits.omnivoreTitle') }];
}

function getCompletionTraits(): Trait[] {
    const { movies } = snapshot;
    const processedCount = movies.watched.length + getStartedShows(snapshot).length;
    const totalCount = movies.watched.length + movies.pending.length + getAllShows(snapshot).length;

    if (totalCount === 0 || processedCount / totalCount < 0.5) {
        return [{ name: 'hoarder', title: translate('stats.traits.hoarderTitle') }];
    }

    return [{ name: 'completionist', title: translate('stats.traits.completionistTitle') }];
}

function getMediaTypeTraits(): Trait[] {
    if (10 * getStartedShows(snapshot).length > snapshot.movies.watched.length) {
        return [{ name: 'seriesJunkie', title: translate('stats.traits.seriesJunkieTitle') }];
    }

    return [{ name: 'movieBuff', title: translate('stats.traits.movieBuffTitle') }];
}
</script>
