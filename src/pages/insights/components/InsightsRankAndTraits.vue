<template>
    <InsightsCard class="flex-row">
        <div class="flex flex-1 flex-col">
            <Markdown inline class="text-2xl font-medium text-gray-900" :lang-key="`insights.ranks.${rank}.title`" />
            <Markdown
                inline
                class="mt-1 leading-normal text-gray-600"
                :lang-key="`insights.ranks.${rank}.description`"
            />
        </div>
        <ul v-if="traits" class="flex w-64 flex-wrap gap-2 self-start" :aria-label="$t('insights.traits.title')">
            <li
                v-for="trait in traits"
                :key="trait.name"
                class="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm font-medium"
                :title="trait.title"
            >
                {{ $t(`insights.traits.${trait.name}`) }}
            </li>
        </ul>
    </InsightsCard>
</template>

<script setup lang="ts">
import { translate } from '@aerogel/core';
import { arraySorted, isTruthy, objectEntries, required } from '@noeldemartin/utils';
import { computed } from 'vue';

import { shuffle } from '@/lib/arrays';
import { TMDB_GENRES } from '@/lib/tmdb';
import { getAllShows, getEpisodesWatched, getStartedShows } from '@/pages/insights/utils/insights';
import type { CollectionSummary } from '@/pages/insights/utils/insights';
import TMDB from '@/services/TMDB';

interface Trait {
    name: string;
    title: string;
}

const { collection } = defineProps<{ collection: CollectionSummary }>();
const watchPoints = computed(() => collection.movies.watched.length + getEpisodesWatched(collection));

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

    return shuffle([...getGenreTraits(), ...getVarietyTraits(), ...getCompletionTraits(), ...getMediaTypeTraits()]);
});

function getGenreTraits(): Trait[] {
    const genreTraits = {
        'Science Fiction': 'sciFiGeek',
        Animation: 'cartoonist',
        Crime: 'crimeJunkie',
        Documentary: 'documentarian',
        Fantasy: 'dreamer',
        Horror: 'horrorHound',
        Mystery: 'detective',
        Romance: 'romanceJunkie',
        Western: 'gunslinger',
    } satisfies Partial<Record<keyof typeof TMDB_GENRES, string>>;

    const genreIdTraits = new Map<number, string>(
        objectEntries(genreTraits).map(([genre, trait]) => [TMDB_GENRES[genre], trait]),
    );

    return collection.taste.all.genres
        .slice(0, 3)
        .map((genre) => {
            const trait = genreIdTraits.get(genre.key);

            return (
                trait && {
                    name: trait,
                    title: translate('insights.traits.genreTitle', {
                        genre: TMDB.translateGenre(genre.key) ?? String(genre.key),
                    }),
                }
            );
        })
        .filter(isTruthy);
}

function getVarietyTraits(): Trait[] {
    const genres = collection.taste.all.genres;
    const topCount = genres.slice(0, 3).reduce((sum, genre) => sum + genre.count, 0);
    const totalCount = genres.reduce((sum, genre) => sum + genre.count, 0);

    if (topCount > totalCount * 2) {
        return [
            {
                name: 'specialist',
                title: translate('insights.traits.specialistTitle'),
            },
        ];
    }

    return [{ name: 'omnivore', title: translate('insights.traits.omnivoreTitle') }];
}

function getCompletionTraits(): Trait[] {
    const { movies } = collection;
    const processedCount = movies.watched.length + getStartedShows(collection).length;
    const totalCount = movies.watched.length + movies.pending.length + getAllShows(collection).length;

    if (totalCount === 0 || processedCount / totalCount < 0.5) {
        return [{ name: 'hoarder', title: translate('insights.traits.hoarderTitle') }];
    }

    return [{ name: 'completionist', title: translate('insights.traits.completionistTitle') }];
}

function getMediaTypeTraits(): Trait[] {
    if (10 * getStartedShows(collection).length > collection.movies.watched.length) {
        return [{ name: 'seriesJunkie', title: translate('insights.traits.seriesJunkieTitle') }];
    }

    return [{ name: 'movieBuff', title: translate('insights.traits.movieBuffTitle') }];
}
</script>
